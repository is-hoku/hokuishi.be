---
title: "Mac のセットアップ"
date: "2021/10/03"
slug: "setup_mac"
---

最近二度 Mac のセットアップをして、毎回結構時間が取られるので [dotfiles](https://github.com/is-hoku/mac-dotfiles) を作りました。1 回目で作らなかったことを後悔しました。以下、Mac が手元に来たらやること。

## Homebrew のインストール

```bash
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## dotfiles のインストール

git clone して、`install.sh` を実行します。ここで環境に必要なパッケージを brew でインストールして、dotfiles たちのシンボリックリンクを貼っています。ついでに vim の undo で使うディレクトリを作成します。  
その後、vim を開いて `:PluginInstall` で必要なプラグインを入れます。

## JIS 配列の対応

dotfiles は JIS 配列のキーボードを US 配列ぽく使うことを想定していて、Mac のキーボード設定で US 配列に変更後、karabiner で \_ (international1)にチルダ(grave_accent_and_tilde)を割り当てています。キーボードの設定を変えてもなぜか左側のキーが JIS 配列のままだったので、CapsLock と Ctrl をそれぞれ Ctrl, Esc にリマップしています。

## YubiKey を使う

gpg-suite がインストールされているため、YubiKey に焼いてある鍵を使えます。
公開鍵サーバや Keybase から公開鍵をインポートして、YubiKey を PC に挿した状態で `gpg --card-status` を実行することでキーチェーンが YubiKey を認識します。その後、GPG Keychain で自分の鍵の信用を Ultimate にします。

## GitHub を使う

`~/.gitconfig.local` を作成して、

```
[user]
	name = [user_name]
	email = [user_email]
	signingkey = [fingerprint]
```

↑ を書き込みます。

GitHub でアクセストークンを生成して、初めのコミットで入力します。

## Go を使う

GOPATH を設定します。

```
export GOPATH=~/go
export PATH="$GOPATH/bin:$PATH"
```

goimports をインストールします。

```bash
$ go install golang.org/x/tools/cmd/goimports@latest
```

`.vimrc` で vim-goimports がインストールされるため、`:w` でフォーマットが走るようになります。

## Git の補完

`.zshrc` に必要な設定が以下のようにあるので、`~/.zsh` 下に git-completion.zsh (\_git にリネーム) と git-completion.bash を置きます。

```
fpath=(~/.zsh $fpath)
autoload -U compinit
compinit -u
```

## おわり

Mac のセットアップと言ってもターミナルと vim の設定ファイルを持ってくるだけだと思ってはじめは dotfiles を作りませんでしたが、JIS 配列のキーを変えたり YubiKey を使えるようにしたり、やることが多くなってきたので dotfiles を作りました。多少は管理とセットアップが楽になったかと思います。
