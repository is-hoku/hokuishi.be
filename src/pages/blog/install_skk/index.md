---
title: "SKK を Arch Linux にインストール"
date: "2021/11/02"
slug: "install_skk"
description: "Vim で日本語入力が辛いと思っていたら、SKK という IM を見つけたのでインストールしました。結構快適に感じてきたので、ずっと使ってきた Mozc から SKK に完全に乗り換えました。"
---

Vim で日本語入力が辛いと思っていたら、SKK という IM を見つけたのでインストールしました。結構快適に感じてきたので、ずっと使ってきた Mozc から SKK に完全に乗り換えました。

## Vim で SKK を使う

[eskk.vim](https://github.com/vim-skk/eskk.vim) をインストールします。

```vim
Plugin 'vim-skk/eskk.vim'
```

次に SKK 辞書を入れます。

```bash
$ paru -S skk-jisyo
```

`.vimrc` に辞書ファイルの場所を書きます。

```vim
let g:eskk#directory = "~/.config/eskk"
let g:eskk#dictionary = {'path': "~/.config/eskk/my_jisyo", 'sorted': 1, 'encoding': 'utf-8',}
let g:eskk#large_dictionary = {'path': "~/.config/eskk/SKK-JISYO.L", 'sorted': 1, 'encoding': 'euc-jp',}
let g:eskk#kakutei_when_unique_candidate = 1
let g:eskk#keep_state = 0
let g:eskk#egg_like_newline = 1
```

## Fcitx で SKK を使う

[fcitx-skk](https://archlinux.org/packages/community/x86_64/fcitx-skk/) をインストールします。

```bash
$ paru -S fcitx-skk
```

fcitx-configtool を起動して SKK を追加します。このとき English も残しておきます。

![fcitx-configtool](/fcitx_configtool_screenshot.png)

その後、Global Config > Show Advanced Options > Program で Default Input Method State を Active にします。こうすることで PC 起動時に SKK が使えるようします。

`.config/fcitx/skk/dictionary_list` を作成して使う辞書の場所を書いておきます。

```vim
type=file,file=$FCITX_CONFIG_DIR/skk/user.dict,mode=readwrite
type=file,file=/usr/share/skk/SKK-JISYO.L,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.assoc,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.china_taiwan,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.fullname,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.geo,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.itaiji,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.itaiji.JIS3_4,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.jinmei,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.JIS2,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.JIS2004,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.JIS3_4,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.law,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.lisp,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.M,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.mazegaki,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.ML,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.okinawa,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.propernoun,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.pubdic+,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.requested,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.S,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.station,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.wrong,mode=readonly
type=file,file=/usr/share/skk/SKK-JISYO.wrong.annotated,mode=readonly
```

これで SKK を使って日本語入力ができるようになりましたが、このままだと Vim 上でも fcitx-skk が使われてしまうため、ノーマルモードに戻るときにいちいち l を押す必要があり Mozc の時と同じ問題が生じてしまいます。Vim では Keyboard-English(US) の状態で eskk.vim を使い、その他の作業では Fcitx は常に SKK の状態であることが理想です。  
これを解決するために `.vimrc` で、インサートモードの時 IM を無効化するようにしています。

```vim
set iminsert=0
set imsearch=0
set imactivatefunc=ImActivate
function! ImActivate(active)
  if a:active
    call system('fcitx-remote -o')
  else
    call system('fcitx-remote -c')
  endif
endfunction
set imstatusfunc=ImStatus
function! ImStatus()
  return system('fcitx-remote')[0] is# '2'
endfunction
```

## まとめ

特に Vim での日本語入力が強力だと感じました。  
早く SKK で思考のスピードで編集できるようになりたい。

## 参考

-   [SKK とは (エスケイケイとは) [単語記事] - ニコニコ大百科](https://dic.nicovideo.jp/a/skk)
-   [Vim から fcitx を使う - Qiita](https://qiita.com/sgur/items/aa443bc2aed6fe0eb138)
