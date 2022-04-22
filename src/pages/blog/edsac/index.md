---
title: "EDSAC のアーキテクチャ"
date: "2022/01/17"
slug: "edsac"
description: "EDSAC について調べたりシミュレータを作ったりして、理解したことのまとめです。"
---

EDSAC について調べたりシミュレータを作ったりして、理解したことのまとめです。

## EDSAC とは

EDSAC (Electronic Delay Storage Automatic Calculator) はイギリスのケンブリッジ大学で開発された、世界初の実用的なプログラム内蔵方式のコンピュータです。イニシャルオーダーやサブルーチンなどが実装されていて、ソフトウェア産業の出発点らしいです。調べていると西尾さんのブラウザで動く[シミュレータ](http://nhiro.org/learn_language/repos/EDSAC-on-browser/index.html)やケンブリッジ大学の[ポスター](https://www.cl.cam.ac.uk/~mr10/edsacposter.pdf)を見つけて、すごく面白そうだと思いました。

## アーキテクチャ

命令: 17 bits (Op: 5 bits + Unused: 1 bit + Address: 10 bits + S/L: 1 bits)

レジスタ

-   乗算レジスタ: 35 bits
-   アキュムレータ: 71 bits

記憶装置

-   短語: 17 bits (1024 words)
-   長語: 35 bits (短語 + padding bit + 短語, 512 words)

数値

-   2 の補数表現の 2 進数
-   乗算器では -1 <= x < 1 (小数、2 の補数表現の 2 進数)

ここで記憶装置が 35 bits で表現できる文字が制限されるため、Letter Shift で英大文字を使い, Figure Shift で数字と記号を使います。

## 命令セット

-   AnS: A += m[n], AnL: AB += w[n]
-   SnS: A -= m[n], SnL: AB -= w[n]
-   HnS: R += m[n], HnL: RS += w[n]
-   VnS: AB += m[n] _ R, VnL: ABC += w[n] _ RS
-   NnS: AB -= m[n] _ R, NnL: ABC -= w[n] _ RS
-   TnS: m[n] = A; ABC = 0, TnL: w[n] = AB; ABC = 0
-   UnS: m[n] = A, UnL: w[n] = AB
-   CnS: AB += m[n] & R, CnL: ABC += w[n] & RS
-   RnS, RnL: 命令の最下位ビットから数えて初めて 1 が見つかったポジション分だけ ABC を右シフト
-   LnS, LnL: 命令の最下位ビットから数えて初めて 1 が見つかったポジション分だけ ABC を左シフト
-   EnS: if A >= 0 goto n
-   GnS: if A < 0 goto n
-   InS: 紙テープから次の文字を読み取り m[n] の上位 5 bits に格納
-   OnS: m[n] の上位 5 bits を出力する
-   ZnS: プログラム終了

ここで w[2n] は記憶装置 (35 bits) を表し、m[2n+1], m[2n] は 1 word (17 bits) を表します。また ABC はアキュムレータ、A, AB はそれぞれアキュムレータの上位 17 bits, 35 bits を表します。RS は乗算レジスタ、R はその上位 17 bits を表します。S (0), L (1) はオペランドが表すものが Short (17 bits) か Long (35 bits) かを表します。

## イニシャルオーダー

EDSAC にはアセンブラのようなソフトウェアであるイニシャルオーダー (initial orders) というものが搭載されています。これは起動時にメモリに読み込まれます。その後、メモリの内容が実行されていきます。初めはイニシャルオーダーが入っているので、これによってパンチカードの内容が 1 文字ずつイニシャルオーダーの後のメモリに読み込まれます。全ての文字を読むまでイニシャルオーダーがループされ、イニシャルオーダーが終了するとメモリに格納されたカードの内容が実行されてプログラム終了です。

以下がイニシャルオーダーです。 I と II があるそうですが、以下は I の方です。  
左から命令のビット列、メモリのアドレス、命令です。

```
00101 0 0000000000 0	0 T0S
10101 0 0000000010 0	1 H2S
00101 0 0000000000 0	2 T0S
00011 0 0000000110 0	3 E6S
00000 0 0000000001 0	4 P1S
00000 0 0000000101 0	5 P5S
00101 0 0000000000 0	6 T0S
01000 0 0000000000 0	7 I0S
11100 0 0000000000 0	8 A0S
00100 0 0000010000 0	9 R16S
00101 0 0000000000 1	10 T0L
01000 0 0000000010 0	11 I2S
11100 0 0000000010 0	12 A2S
01100 0 0000000101 0	13 S5S
00011 0 0000010101 0	14 E21S
00101 0 0000000011 0	15 T3S
11111 0 0000000001 0	16 V1S
11001 0 0000001000 0	17 L8S
11100 0 0000000010 0	18 A2S
00101 0 0000000001 0	19 T1S
00011 0 0000001011 0	20 E11S
00100 0 0000000100 0	21 R4S
11100 0 0000000001 0	22 A1S
11001 0 0000000000 1	23 L0L
11100 0 0000000000 0	24 A0S
00101 0 0000011111 0	25 T31S
11100 0 0000011001 0	26 A25S
11100 0 0000000100 0	27 A4S
00111 0 0000011001 0	28 U25S
01100 0 0000011111 0	29 S31S
11011 0 0000000110 0	30 G6S
```

0 行目から 5 行目までは一度だけ実行されるもので、m[0] で命令のオペコードを一時的に保持し、m[1] でオペランドを保持します。また、m[4] で定数 2、m[5] で定数 10 を保持します。これは P1S = 00000 0 0000000001 0 = 2 だからです。  
6 行目からはループされる部分で、数字の場合はアキュムレータにビットシフトしながら (10 進数でいう 1 桁ごとに) 加算していくことで実際のオペランドの数字になります。

## プログラム

西尾さんのシミュレータを使って A と出力するだけのプログラムを作りました。

```
T34S
O8S
ZS
```

## 分からないこと

イニシャルオーダー I と II の違いが曖昧。相対アドレスなどが扱えるようになったとか？またサブルーチンのソースコードを追えませんでした。

## 参考文献

-   [EDSAC Initial Orders and Squares Program - UNIVERSITY OF CAMBRIDGE Computer Laboratory](https://www.cl.cam.ac.uk/~mr10/edsacposter.pdf)
-   [EDSAC on browser](http://nhiro.org/learn_language/repos/EDSAC-on-browser/index.html)
-   [EDSAC のプログラム技法 - パラメトロン計算機](http://parametron.blogspot.com/2012/09/edsac.html)
-   [EDSAC PROGRAM DOCUMENTATION](http://cd.textfiles.com/230/EMULATOR/DIVERSE/EDSAC/EDSACDOC.PDF)
-   [Tutorial Guide to the EDSAC Simulator - The EDSAC Replica Project](https://www.dcs.warwick.ac.uk/~edsac/Software/EdsacTG.pdf)
-   [EDSAC のイニシャルオーダーがわからない日記 - 西尾泰和のはてなダイアリー](https://nishiohirokazu.hatenadiary.org/entry/20120624/1340507174)
-   [EDSAC - WIKIPEDIA](https://en.wikipedia.org/wiki/EDSAC#:~:text=The%20Electronic%20delay%20storage%20automatic,was%20an%20early%20British%20computer.&text=EDSAC%20was%20the%20second%20electronic,Lyons%20%26%20Co.)
