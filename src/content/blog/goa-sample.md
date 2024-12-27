---
title: "Goa v3 を使ってみた"
description: "Goa v3 を使って簡単な REST API を作ってみました。"
pubDate: "2022/08/17"
tags: ['go', 'goa', 'web']
---

## 概要

[Goa](https://github.com/goadesign/goa) v3 を使って簡単な REST API サーバを作ってみました。  
コードは[ここ](https://github.com/is-hoku/goa-sample)にあります。ドメインを学生証のデータとし、学籍番号から学生の取得、全ての学生の取得、学生の登録を実装しました。


## Goa とは

> Goa is a Go framework for writing microservices that promotes best practice by providing a single source of truth from which server code, client code, and documentation is derived.

(引用：[Introduction](https://goa.design/learn/introduction/))

## 問題

今回 API サーバを作る際に前提として次のような課題があり、これらを解決できるような方針で設計しました。実装したら結果的に解決できていて、後から認識した問題もありますが。

-   ドキュメントとコードが乖離する
-   ORM を使うことで実際に発行されているクエリが分かりにくくなる
-   テーブル定義とモデル (コード) が乖離する (型安全でない)

## 解決策

まず Goa ではデザインファイルを DSL で書いて API の設計をしていき、 `goa gen` コマンドを実行することでデザインからコードと OpenAPI ドキュメントを生成します。コードからドキュメントが生成されるのでこれらは乖離しません。また API 定義からプレゼンテーション層のコードを生成してくれるため便利です。具体的にはエンコード・デコード、バリデーションなどを行うコードを生成してくれます。そのためプログラマはビジネスロジックの実装に集中できます。[ここ](https://goa.design/implement/implementing/)の「Putting It All Together」に分かりやすい図があります。  
次に ORM を使うと実際に発行されているクエリが分かりにくくなる問題ですが、これは Gorm などを使わず単純に標準パッケージの database/sql のみで実装すれば解決です。しかし、そうすると今度はテーブル定義とコードが乖離してしまう可能性があり型安全でないとう問題が発生します。これを解決するために [sqlc](https://github.com/kyleconroy/sqlc) を採用しました。 sqlc はテーブル定義、クエリ定義、設定ファイルから型安全なコードを生成してくれるため、テーブル定義は常にコードと離れず型安全です。またプログラマが SQL クエリを書くため、実装しているコードが最終的にどのようなクエリを叩くかを把握しにくくなることがありません。  
Goa と sqlc によって外部からのデータのやりとり (リクエストのパスパラメータなど) と DB とのデータのやりとりのコードを書く手間が無くなりそれによって型安全にもなったので嬉しいです。

## エラーレスポンス

Goa のデフォルトのエラーレスポンスでは id などの無駄な情報があったり、そもそも生のエラー文をメッセージとして返したりするため、デザインで独自のエラーレスポンス型を定義しコードの中でそれを使用するようにします。これは大抵の状況でうまく行きますが、リクエストのバリデーションなど (つまり Goa が自動生成したコード) でエラーが返されるとプログラマがハンドリングできないため問答無用でデフォルトのエラーレスポンス型に 500 と生のエラー文が入れられて返されます。これは嫌なので次のように自分でレスポンスのフォーマッタを書きます。 (例えばパスラメータが uint の所に -1 が渡された場合、型が不正のため 500 が返されますが、本来は 400 を返したいなど)

```go
func customErrorResponse(err error) goahttp.Statuser {
	// Error Handling for Decoding & Validation
	if serr, ok := err.(*goa.ServiceError); ok {
		switch serr.Name {
		case "invalid_field_type":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Field Type"}
		case "missing_field":
			return &student.CustomError{Name: "bad_request", Message: "Missing Field"}
		case "decode_payload":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Body"}
		case "invalid_format":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Format"}
		default:
			return &student.CustomError{Name: "internal_error", Message: "Internal Server Error"}
		}
	} else if serr, ok := err.(*student.CustomError); ok { // Error Handling for Business logic
		return &student.CustomError{Name: serr.Name, Message: serr.Message}
	}
	return &student.CustomError{Name: "internal_error", Message: "Internal Server Error"}
}
```

これを `New()` の引数で指定することでレスポンスを作成する時に独自フォーマッタを通してくれるようになります。

```go
studentServer = studentsvr.New(studentEndpoints, mux, dec, enc, eh, customErrorResponse)
```

この方法は[ここ](https://goa.design/implement/error_handling/)に書いてあります。これでエラーレスポンスを理想通り返すようになりました。

## まとめ

Goa v1/v2 から v3 で DSL が変わっていたり、生成結果が変わっていたりした ([Upgrading from Goa v1 or Goa v2 to v3](https://goa.design/learn/upgrading/)) ため最初は混乱しましたが、いい感じの構成で作れて満足です。
