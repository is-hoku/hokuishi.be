---
title: "PIXIV SPRING BOOT CAMP 2024 参加記"
description: "PIXIV SPRING BOOT CAMP 2024 の参加記です．"
pubDate: "2024/03/16"
tags: ['php', 'phpstan', 'static-analysis', 'intern']
---

![pixiv-entrance](/pixiv-entrance.jpg)

## はじめに

3/6 ~ 3/15 の 8 日間，ピクシブ株式会社様で短期インターンをさせていただきました．
[pixiv ウェブエンジニアリングコース](https://internship.pixiv.co.jp/course/infra#pixiv-web)で，PHPStan upstream への貢献や PHPStan を用いた社内ルール開発，Rector でリファクタリングツールの開発などを行いました．  
インターンの流れや課題として取り組んだこと，感想を書いていきます．

## 選考

書類選考とオンライン面談がありました．
面談では PHP の経験はほとんど無いけれど，静的解析に興味があるということを伝えました．
コーディングテストがあると聞いていたため身構えていたのですが，面接のような雰囲気ではなくプログラミング言語や型に関する雑談をして楽しかったのを覚えています．

## 事前学習

インターン開始前に [PHP: The Right Way](http://ja.phptherightway.com/) と [PHPStan クイックガイド 2023](https://zenn.dev/pixiv/articles/7467448592862e) に目を通して，PHP の作法と PHPStan の使い方を押さえました．

## やったこと

インターン期間に課題として取り組んだことです．

### PHPStan に PR を出す

これが初日の課題でした．
PHPStan の strlen 拡張と mb_strlen 拡張の挙動を合わせるというもので，[PR](https://github.com/phpstan/phpstan-src/pull/2957) を投げて退勤し，夕食をとっているとマージされていました．
初日から PHPStan に貢献することができて，興奮していました．  
ちなみにこれらの拡張は内部で実際の `strlen()` を適用して型推論をしていて面白いです (静的解析とは？)．

### pixiv.git の PHPDoc エラーを潰す

pixiv.git の baseline で報告されているエラーの内，PHPDoc が原因のものを修正していました．
基本的に壊れたタグの修正や型タグの追加をしていました．  
この課題を通して PHPStan を黙らせるためにエラーを消していくことは必ずしも得策ではないことを理解しました．
例えば異なる型に推論された値同士の演算を PHPStan に怒られているとします．
このような場合，PHPStan の警告に従って型宣言を直したり強引にキャストしたりして PHPStan を黙らせたくなってしまいますが，そのコードはテストが通って実際に動いているという事実を受け入れなければいけません．
偶然コーナーケースに引っ掛からずにバグが見過されていたのか，PHPStan の型宣言が適切でなかったのか，あるいは両方なのか，見極めるのは人間です．

### PHPerKaigi に参加

インターン期間と開催期間が偶然被っていて，メンターの tadsan も登壇するということで，[PHPerKaigi 2024](https://phperkaigi.jp/2024/) に参加させていただきました．
PHPerKaigi もオフラインカンファレンスも初めてで，かつ PHPer 歴がこの時点で 3 日目だったため十分に楽しめるか不安でしたが，行ってみるととても楽しいカンファレンスで，トーク発表を聴講したり色々な方とお話ししたりと刺激的な時間でした．
初対面のランダムな 4 人でランチに行く企画で一緒になった方が二年前に tadsan のコースでインターンをしていたり，企業ブースに学校の元先輩がいたりと，エンジニアの世界は狭いなとも思いました．

### PHPStan Custom Rules で array_keys() と Arr::keysAsString() 使い分けルール

`array_keys()` の挙動は不安定で，以下のような状況では `array{'foo', 'zero', '111'}` という型ではなく `array{'foo', 'zero', 111}` が返ってきます．

```php
<?php declare(strict_types = 1);
$names = [
     'foo',
     'zero',
     '111',
];
PHPStan\dumpType(array_keys(array_flip($names)));
```

このような想定外の動作を回避するために，`array_keys()` の型安全バージョンとして`Arr::keysAsString()` を定義しているのですが，これは型推論できない変数 (外部からの入力など) やキーに string 以外の型が混入している配列にのみ適用すれば良いです．
このようなプロジェクト独自のルールを追加するために，[Custom Rules](https://phpstan.org/developing-extensions/rules) を使用します．
今回は引数の型と配列のキーの型に応じて `array_keys()` と `Arr::keysAsString()` を使い分けるルールを実装しました．

### Dynamic Return Type Extension でメソッドの返り値に型をつける

以下のような状況で `GetHoge()` などキーの数だけ存在するメソッドの返り値に型をつけたい欲求がありました．
何も型をつけないと返り値は `string|array` と推論されてしまい，呼び出し側でアサーションが必要です．

```php
/**
* @phpstan-type secret_keys array{
*   HOGE: non-empty-string,
*   FUGA: non-empty-string,
*   NYAN: secret_key_encryption,
~~~~~ 省略 ~~~~~
/**
* @phpstan-var secret_keys
*/
private static $_keys;
public function GetHoge()
{
    return $_keys["HOGE"];
}
```

そこで [Dynamic Return Type Extensions](https://phpstan.org/developing-extensions/dynamic-return-type-extensions) を使用して返り値に型をつけることが考えられます．
メソッドの引数の型によって返り値の型が決まるようなものは以下のようにジェネリクスで解決できますが，今回はキーに対応した複数のメソッドの返り値に型をつけたいため適用できません．

```php
<?php declare(strict_types = 1);
/**
* @template T
* @param T $s
* @return T
*/
function hoge($s)
{
	return $s;
}
```

たしかにこのような状況で Dynamic Return Type Extensions で型付けはできますが，そのためにキーとそれに対応する型のマッピングを持たなければならず，これは PHPDoc との二重管理になってしまいます．
また，人間の手には負えない数のメソッドの型付けに Dynamic Return Type Extensions を利用することは有効ですが，今回は愚直に型付けできる量のため，わざわざ拡張を書く程のうまみがありませんでした．
そもそも `$_keys` の値をマジックメソッドで取得するように実装し直せば愚直に型付けする必要がないという話もあり，拡張での実装はしない方針になりました．

### Rector で TestHelper のメソッドを Closure に展開する

Rector という自動リファクタリングツールを用いて ~~邪悪な~~ メソッドを Closure に展開する実装をしました．

既存コードとして以下のようなテストヘルパーがあります．
テスト対象メソッドを文字列で渡していたり，メソッドの引数を配列で渡していたりして静的解析が困難になっています．

```php
// Sample_Common::_privateMethod(1, 'hoge', ['a' => 1]) を呼び出す
$actual = TestHelper::callPrivateStaticMethod('Sample_Common::_privateMethod', [
    1,
    'hoge',
    ['a' => 1],
]);
```

そこで以下のように `Closure::bind()` に展開してやります．

```php
$actual = Closure::bind(
    fn() => Sample_Common::_privateMethod(1, 'hoge', ['a' => 1])
    null,
    Sample_Common::class,
)();
```

Rector では対象ノードを見つけた時にそのノードやスコープの情報からノードを再構成できます．

## 技術的なことの感想

PHP で型宣言をしなければ実行時の型安全性は何も保証されておらず，PHPStan での型宣言はいかようにもできてしまうため，慎重に行う必要があると思いました．
動いているコードが先にあって，後から型をつけていって安全に開発できるようにするという戦略のため，PHPStan の警告に従って全てに型をつけてまわれば解決という単純な話ではなく，適切な型を人間がつけてやる必要があります．
また，PHP が動的型付きだからこそリッチな静的解析が求められた結果，PHPStan や Rector などのツールがあるというのも面白いです．

## 技術的なこと以外の感想

インターンに応募した時点では静的解析がしたいという欲求のみで，あまり就活について深く考えていませんでしたが，今回のインターンを通して真面目に自分の人生における就職というイベントについて考えるようになりました．
それはメンターの tadsan と働くことで理想のエンジニア像について考えるようになったことが大きいです．
言語機能や型について造詣が深く，エディタやシェル芸を使いこなし，OSS やコミュニティに貢献をして，社内での安全な開発のために静的解析ツールを整備・開発する姿は，まさに憧れのハッカーという感じでした．
tadsan をはじめとしてピクシブの技術力の高いエンジニアの方に質問をしたり雑談をしたりすることができて，とても贅沢な時間だったと思います．

また，今回のインターンでエンジニアの方と交流したり，社内イベントに参加したりすることで，ピクシブの文化やそこで働く人々の雰囲気を知ることができました．
技術や PIXIV が好きな人ばかりの楽しい環境で働けることや，自社開発で社内公募があること，OSS やソフトウェアの品質に貢献するチーム (特定の製品ではなく技術に特化したウェブエンジニアリングチーム) が存在することなどが魅力的だと思いました．

## おわりに

8 日間のインターンを通して，技術力の高いエンジニアの方達と交流して刺激と知見を得ながら成長することができました．
始めは手探りでしたが，複数の課題に取り組むことで徐々にそれらの実装の元にある一貫した型付けのアプローチや思想について理解することができて快感でした．
また，働く人々や環境が本当に素敵で毎日が刺激的で楽しく濃密なインターン期間でした．

メンターの tadsan，サブメンターの namazu さん，ウェブエンジニアリングチームの方々，人事の mariko さん，他にもサポートや交流してくださった方々，ありがとうございました！
