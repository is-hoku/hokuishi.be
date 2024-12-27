---
title: "Goa v3 の気をつけポイント"
description: "Goa v1 から v3 に移行する時に気をつけるべきポイントと解決策です。"
pubDate: "2022/12/14"
tags: ['go', 'goa', 'web']
---

この記事は[フラー株式会社 Advent Calendar 2022](https://qiita.com/advent-calendar/2022/fuller-inc)の 14 日目の記事です。  
13 日目 の記事は [@Juliennu](https://qiita.com/Juliennu) さんで「[インスタなどでよく見る重なり合うアイコンを UIStackView で作ってみた](https://qiita.com/Juliennu/items/4b10a4b242381f6048db)」でした。

## はじめに

Goa はマイクロサービスを開発するための Go のフレームワークで、 API の定義を Goa DSL で記述することで API スキーマとプレゼンテーション層のコードを生成します。

これにはデザイン (API 定義) とドキュメントが乖離しない点、ビジネスロジックの実装に集中できる点で恩恵があります。 DSL を Go で書ける点も Go のフォーマッタなどが使用できて賢いと思います。

業務では Goa v1 (を[社員の方がフォークしたもの](https://github.com/shogo82148/goa-v1)、以降 Goa v1 とはこれを指します) を使っていますが、現在 Goa v3 が主に開発されていて個人開発では v3 を使っていました。そこで遭遇した Goa v1 から v3 に移行する時の気をつけポイントと解決策を書きます。

Goa v3 を使った実装は [is-hoku/goa-sample](https://github.com/is-hoku/goa-sample) にあります。

## 共通エラーが作れない

Goa の標準のエラーレスポンスは [ServiceError](https://pkg.go.dev/goa.design/goa/v3/pkg#ServiceError) のインスタンスで、不要だったりあまりユーザに返したくないフィールドがあるため、自前でエラーレスポンスを定義したくなります。 API で共通のエラーレスポンス構造体を定義しておいてそれを使えばよさそうですが、 Service 毎にパッケージが別れるため、それぞれの Service でエラーを書かないといけません。デザインでは共通のエラーレスポンスの型を定義したとしても v3 では `goa gen` を実行すると `/gen/{service}` のように Service 毎にパッケージが別れてその中にデザインで書いた自前のエラー構造体が記述されます。そのため API で共通のエラーレスポンス形式を作れません。

## 自前のエラーレスポンス定義が面倒

共通エラーが作れず Service 毎にエラー構造体が定義されるということでしたが、ビジネスロジックの層や自動生成されたプレゼンテーション層で生成されるエラーを自前のエラーにフォーマットして返却するためには `/gen/http/{service}/server` の New 関数の最後の引数に `goahttp.Statuser` を実装した構造体を返す関数を渡す必要があります。つまりデザインで定義して自動生成されたエラー構造体が `goahttp.Statuser` を実装するようにしてやれば、フォーマット関数の中で自前のエラーに変換して返却できます。

しかし自動生成されたディレクトリにエラー構造体の定義があり、それをレシーバにして `StatusCode() int` を書くため、 `goa gen` の度に消えてしまいます。かといってエラー構造体の定義をどこかのファイルに書き写してそれをレシーバにするのは、せっかく自動生成されたものを写経していてスマートではなさそうです。

またカスタムエラーフォーマット関数に渡ってくるエラーにはプレゼンテーション層で生成された (エンコード、デコード、型チェックなどでコケた時など) `goa.ServiceError` とビジネスロジック層で書かれた自前エラーがあります。自前エラーはそのまま返してやれば良いですが、 `goa.ServiceError` は自前エラーに変換してやります。エラーの名前の種類は [error.go](https://github.com/goadesign/goa/blob/v3/pkg/error.go) に定義されています。

今のところ `goa gen` の度に `StatusCode()` を Service 毎に書いていて、いい感じの解決策が思いついていないです…

Service を生成するコード ↓

```go
studentServer = studentsvr.New(studentEndpoints, mux, dec, enc, eh, studentCustomErrorResponse)
```

カスタムエラーフォーマット関数 ↓

```go
func studentCustomErrorResponse(err error) goahttp.Statuser {
	// Error Handling for Decoding & Validation
	if serr, ok := err.(*goa.ServiceError); ok {
		switch serr.Name {
		case "missing_payload":
			return &student.CustomError{Name: "bad_request", Message: "Missing Payload"}
		case "decode_payload":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Body"}
		case "invalid_field_type":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Field Type"}
		case "missing_field":
			return &student.CustomError{Name: "unauthorized", Message: "Unauthorized"}
		case "invalid_enum_value":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Value of a Payload"}
		case "invalid_format":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Format"}
		case "invalid_pattern":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Value of a Payload"}
		case "invalid_range":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Value of a Payload"}
		case "invalid_length":
			return &student.CustomError{Name: "bad_request", Message: "Invalid Value of a Payload"}
		default:
			return &student.CustomError{Name: "internal_error", Message: "Internal Server Error"}
		}
	} else if serr, ok := err.(*student.CustomError); ok { // Error Handling for Business logic
		return &student.CustomError{Name: serr.Name, Message: serr.Message}
	}
	return &student.CustomError{Name: "internal_error", Message: "Internal Server Error"}
}
```

CustomError の定義 (自動生成) ↓

```go
// CustomError is the error returned error name and message.
type CustomError struct {
	// Name of error
	Name string
	// Message of error
	Message string
}
```

Statuser の実装 ↓

```go
func (err *CustomError) StatusCode() int {
	switch err.Name {
	case "not_found":
		return http.StatusNotFound
	case "internal_error":
		return http.StatusInternalServerError
	case "bad_request":
		return http.StatusBadRequest
	case "unauthorized":
		return http.StatusUnauthorized
	default:
		return http.StatusInternalServerError
	}
}
```

## Payload の指定

デザインでパスパラメータ、ヘッダー、ボディを定義する際、 v3 では [Payload](<[https://pkg.go.dev/goa.design/goa/dsl#Payload](https://pkg.go.dev/goa.design/goa/dsl#Payload)>) に記述します。 Payload は次のような記述が許容されていますが、複数の入力を定義するためには `func()` を使います。

```go
Payload(Type)

Payload(func())

Payload(Type, "description")

Payload(Type, func())

Payload(Type, "description", func())
```

パスパラメータとボディ、認証のヘッダーを一つの Method で同時に定義する場合、次のようにします。

```go
Payload(
	func() {
		Attribute("student_number", UInt32, "Student's unique number")
		Extend(UpdateStudentBodyType)
		Extend(Authorization)
	})
```

## まとめ

Goa v1 から v3 への変更は DSL や生成結果に大きな変更があり、個人的には特に自前でエラーレスポンスを書く場合にいくつか注意が必要だと思いました。

## 参考

-   [goa.design](https://goa.design/)
-   [Goa v1 や Goa v2 から v3 にアップグレードする - goa.design](https://goa.design/ja/learn/upgrading/)

15 日目 の記事は [@is-hoku](https://hokuishi.be/about) で「[Goa と sqlc, Atlas で快適な Web API サーバ開発](https://hokuishi.be/blog/develop-apiserver-with-goa)」です！
