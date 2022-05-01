---
title: "RFC を読みたい"
date: "2022/05/01"
slug: "rfc"
description: "RFC を読みたいと思い、 RFC の概要などについて調べたときのメモです。"
---

RFC を読みたいと思い、 RFC の概要などについて調べたときのメモです。

## RFC (Request for Comments)

-   IETF (Internet Engineering Task Force) が公開する仕様
-   インターネットで用いられる技術や運用
-   すべての RFC が標準なのではない

## Status

-   Standards Track
    -   STANDARD: 標準化の最終段階、標準プロトコル
    -   DRAFT STANDARD: RFC6410 で廃止、標準化への草稿
    -   PROPOSED STANDARD: 標準化への提唱
-   EXPERIMENTAL: 研究成果や実験結果を公開
-   INFORMATIONAL: 情報提供、エイプリルフールのジョーク
-   HISTORICAL: 過去の議論
-   BEST CURRENT PRACTICE: 最良の実践、 Info に留まらないが実際には影響しない、公的なルールと見なされている実務上の文書、標準を実践するための技術的な推奨事項
-   UNKNOWN: 1990 年以前のもので未分類のもの

## Key Words

[RFC2119](https://www.rfc-editor.org/info/rfc2119), [RFC8174](https://www.rfc-editor.org/info/rfc8174)

-   MUST, REQUIRED, SHALL
    -   仕様の絶対条件
-   MUST NOT, SHALL NOT
    -   仕様の絶対的な禁止条件
-   SHOULD, RECOMMENDED
    -   特定の環境で特定の事項を無視する正当な理由が存在するかもしれないが、該当事項を十分に理解して違う方法を選ぶ前に注意深く考慮しなければならない
-   SHOULD NOT, NOT RECOMMENDED
    -   特定の振る舞いが許容されるもしくは有用な時、特定の環境で正当な理由が存在するかもしれないが、該当事項を十分に理解してこのラベルが記述されている振る舞いを実行する前に注意深く考慮しなければならない
-   MAY, OPTIONAL
    -   選択肢である
    -   あるベンダーが特定の市場がそれを要求するもしくはベンダーが他のベンダーがその選択肢を排除しているがプロダクトを向上させるという理由で、その選択肢を含むかもしれない
    -   特定の選択肢が含まれていない実装は選択肢を含む実装との相互運用を備えなければならない (MUST) 、ただし機能的には劣るかもしれない
    -   同様に特定の選択肢を含む実装は選択肢を含まない実装との相互運用に備えなければならない (MUST)
