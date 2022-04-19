import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html className="pr-11 pl-11 lg:mr-96 lg:ml-96">
				<Head>
					<meta
						name="description"
						content="Hoku Ishibe's personal blog"
					/>
				</Head>
				<header className="my-8">
					<a href="/">
						<p className="text-5xl font-bold">hokuishi.be</p>
					</a>
				</header>
				<body className="bg-black text-cyan">
					<Main />
					<NextScript />
				</body>
				<div className="my-40"></div>
				<footer className="flex justify-center my-4 py-8 border-t border-blue">
					<div className="grid-rows-2">
						<div className="grid-span-1 flex justify-around">
							<div className="text-center">
								<a href="https://github.com/is-hoku/">
									<i className="h-12 mx-1 fab fill-current text-cyan text-2xl fa-github"></i>
								</a>
							</div>
							<div className="text-center">
								<a href="https://twitter.com/is_hoku/">
									<i className="h-12 mx-1 fab fill-current text-cyan text-2xl fa-twitter"></i>
								</a>
							</div>
							<div className="text-center">
								<a href="https://keybase.io/is_hoku/">
									<i className="h-12 mx-1 fab fill-current text-cyan text-2xl fa-keybase"></i>
								</a>
							</div>
							<div className="text-center">
								<a href="https://instagram.com/is_hoku/">
									<i className="h-12 mx-1 fab fill-current text-cyan text-2xl fa-instagram"></i>
								</a>
							</div>
						</div>
						<div className="grid-span-1">
							<p>&copy; 2021 Hoku Ishibe</p>
						</div>
					</div>
				</footer>
			</Html>
		);
	}
}

export default MyDocument;
