import { NextPage, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Head from "next/head";
import { getAllPosts, getPostBySlug } from "src/lib/blog";
import markdownToHTML from "src/lib/markdownToHTML";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export const getStaticPaths = async () => {
	const posts = getAllPosts(["slug"]);
	return {
		paths: posts.map((post) => {
			return {
				params: {
					slug: post.slug,
				},
			};
		}),
		fallback: false,
	};
};

export const getStaticProps = async ({ params }: any) => {
	const post = getPostBySlug(params.slug, [
		"slug",
		"title",
		"date",
		"content",
	]);
	const content = await markdownToHTML(post.content);
	return {
		props: {
			post: {
				...post,
				content,
			},
		},
	};
};

const Post: NextPage<Props> = ({ post }) => {
	const router = useRouter();
	if (!router.isFallback && !post?.slug) {
		return <ErrorPage statusCode={404} />;
	}
	return (
		<>
			<Head>
				<title>{post.title + " | hokuishi.be"}</title>
				<meta
					name="description"
					content="Hoku Ishibe's personal blog"
				/>
			</Head>
			<article>
				<h1 className="text-4xl text-center mt-20">{post.title}</h1>
				<div>
					<p className="text-center mt-3 mb-11">{post.date}</p>
					<div dangerouslySetInnerHTML={{ __html: post.content }} />
				</div>
			</article>
		</>
	);
};

export default Post;
