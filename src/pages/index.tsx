import type { InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { getAllPosts } from "src/lib/blog";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticProps = async () => {
	const allPosts = getAllPosts(["slug", "title", "date", "tags"]);
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

			<div className="z-10 flex flex-col justify-center">
				<h1 className="text-xl font-bold my-3">
					[blog@hokuishi.be:~]$ ls posts
				</h1>
			</div>
			{allPosts.map((post) => (
				<div className="my-12">
					<a href={"blog/" + post.slug} key={post.slug}>
						<h2 className="text-3xl">{post.title}</h2>
						<p className="text-xl pt-3">{post.date}</p>
					</a>
				</div>
			))}
		</>
	);
};

export default Index;
