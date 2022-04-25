import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { getAllPosts } from "src/lib/blog";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps = async () => {
	const allPosts = getAllPosts(["slug", "title", "date"]);
	return {
		props: { allPosts },
	};
};

const Index: NextPage<Props> = ({ allPosts }) => {
	return (
		<>
			<Head>
				<title>hokuishi.be</title>
				<meta
					name="description"
					content="Hoku Ishibe's personal blog"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className="mt-32">
				{allPosts.map((post) => (
					<div className="my-12" key={post.slug}>
						<a
							href={"blog/" + post.slug}
							key={post.slug}
							className="hover:underline"
						>
							<h2 className="text-3xl">{post.title}</h2>
						</a>
						<p className="text-xl pt-3">{post.date}</p>
					</div>
				))}
			</div>
		</>
	);
};

export default Index;
