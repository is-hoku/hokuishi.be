---
title: "YubiKey と Bitwarden によるアカウント管理"
date: "2021/10/09"
slug: "account_maangement"
description: "
少し前にアカウント管理を見直して現在とりあえず以下の方法で落ち着いたので、その時のことを思い出しつつ忘れないようにメモを書いておきます。"
---

少し前にアカウント管理を見直して現在とりあえず以下の方法で落ち着いたので、その時のことを思い出しつつ忘れないようにメモを書いておきます。

## 今までの管理

メールアドレスについては Gmail を 2 つ持っていて、通常用と比較的重要なもの用で分けていました。重要なもの用は銀行などのアカウントに使っていました (あんまり良くない) 。パスワードは固定文字列 (コアパスワード) + サービス名 (サービス毎の識別子) で生成していてパスワードマネージャなどは使わず脳みそストレージでした。2FA は SMS 認証のみでした。

## 問題点

上のような管理方法でやっていましたが、この方法にはいくつか問題点がありました。

-   Google アカウントは突然停止される可能性があり、その場合パスワード変更やメールの受信ができなくなる
-   パスワードを毎回入力する手間がある
-   パスワードマネージャを使うよりは脆弱
-   設定できるパスワードの制約 (記号必須や文字数の下限など) のため、パスワード生成ルール通りに作れない時がある
-   SMS 認証は悪意のあるアプリに読み取られたり、ネットワークが盗聴されたり、SIM カードの抜き取りや画面の盗み見で内容を知られたりと危険性 (SMS インターセプト) がある
-   SMS 認証のみだとスマホを紛失した時にアカウントにログインできなくなる

## 対策

Gmail から独自ドメインに移行し重要なアカウントのメールアドレスを変更するようにしました。ドメインは Route53 で購入と管理し、SES で受信したメールを Lambda で Gmail に飛ばすようにしました。メールを受信する Gmail のアカウントは凍結されても、Lambda を少し書き換えるだけなので気が楽です。また、雑多なアカウントは引き続き Gmail で管理するようにしました。  
パスワード管理には [Bitwarden](https://bitwarden.com/) というパスワードマネージャを使うようにしました。採用理由は Chrome の拡張機能があることと、Linux のデスクトップクライアントがあり、Android でも使えるものの中で一番良さげだったからです。  
SMS 認証だけで行っていて、色々な意味で危険性があった 2FA ですが、YubiKey を購入して FIDO U2F と TOTP を導入することで安全性と簡便性を兼ね備えた認証が可能になりました。購入したのは [YubiKey 5C NFC](https://www.yubico.com/jp/product/yubikey-5c-nfc/) で、FIDO U2F と TOTP, OpenPGP に対応していて、端子が USB Type-C であることと NFC を搭載しているため、スマホでも簡単に使える所が良いと思いました。ログインする度にスマホを見ながら数字を打つのは結構面倒で苦痛だったので、PC に挿して触るだけでログインができるのは非常に快適です。

## 2FA の方針

セキュリティーキーが使えるサービスでは FIDO U2F と、スマホの Google Authenticator で TOTP を使うようにして、バックアップコードは紙に印刷して保存するようにしました。セキュリティーキーが使えない Amazon などのサービスでは YubiKey での TOTP と、アプリでの TOTP を設定し、バックアップコードは同じように紙に印刷して保存しました。  
基本的には YubiKey を使えば良くて、YubiKey を紛失したり手元になかったりするときはスマホの TOTP を使うようにします。どちらかを紛失した場合は、手元に残っているものでログインをして、その間に新しいスマホなり YubiKey なりを購入して 2FA のセットアップをし直します。どちらも紛失した時はバックアップコードを使い、なるべく早く他の方法でログインできるようにします。

## まとめ

独自ドメインのメールアドレスを使うことで Google アカウント凍結を心配する必要が無くなりました。また、パスワードマネージャを導入することで毎回のパスワード入力の手間とパスワードを忘れて設定し直すことが無くなり、セキュリティも向上しました。2FA についても SMS インターセプトの危険と、スマホを紛失してログインできなくなるという恐ろしいことが起こらなくなりました。

## 参考

-   [YubiKey と BitWarden で安心 Web 生活 - κeen の Happy Hacκing Blog](https://keens.github.io/blog/2021/03/28/yubikeytobitwardendeanshinwebseikatsu/)
-   [SMS 認証の仕組みと危険性、「TOTP」とは? 「所有物認証」のハナシ - ITmedia](https://www.itmedia.co.jp/news/articles/1904/08/news026.html)
-   [パスワードの不要な世界はいかにして実現されるのか - FIDO2 と WebAuthn の基本を知る](https://blog.agektmr.com/2019/03/fido-webauthn.html)
-   [FIDO の仕組み - FIDO Alliance](https://fidoalliance.org/fido%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF/?lang=ja)
-   [独自ドメインでメールを受信できるようにした - Zenn](https://zenn.dev/seyama/articles/2786ee5f73b314)
-   [Google has locked my account for sharing a historical archive they labeled as "terrorist Activity" - Google Drive Help](https://support.google.com/drive/thread/127021326/google-has-locked-my-account-for-sharing-a-historical-archive-they-labeled-as-terrorist-activity?hl=en)
-   [SMS インターセプト(SMS Intercept)](https://securitychecklist.net/security/cyber-attack/sms-intercept.html)
