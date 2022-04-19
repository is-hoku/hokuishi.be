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
					<div
						className="max-w-none prose prose-h1:text-cyan prose-h2:text-cyan prose-h3:text-cyan prose-h4:text-cyan prose-p:text-cyan prose-a:text-blue prose-blockquote:text-cyan prose-figure:text-cyan prose-figcaption:text-cyan prose-strong:text-cyan prose-em:text-cyan prose-code:text-cyan prose-pre:text-cyan prose-ol:text-cyan prose-ul:text-cyan prose-li:text-cyan prose-li:marker:text-cyan prose-table:text-cyan prose-thead:text-cyan prose-tr:text-cyan prose-th:text-cyan prose-td:text-cyan prose-img:text-cyan prose-video:text-cyan prose-hr:text-cyan prose-strong:font-bold"
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>
					<p>{post.content}</p>
				</div>
			</article>
		</>
	);
};

export default Post;
