import { GetStaticProps } from "next";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Head from 'next/head';

import Link from "next/link";

import { FiCalendar, FiUser } from "react-icons/fi";
import Prismic from "@prismicio/client";
import { useState } from "react";
import styles from "./home.module.scss";
import commonStyles from "../styles/common.module.scss";
import { getPrismicClient } from "../services/prismic";
import Header from "../components/Header";
import { ExitPreviewButton } from "../components/ExitPreviewButton/index";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: unknown;
}

/* - **src/pages/index.tsx**: Utilizar o método `query`
para retornar todos os `posts` já com paginação. Por padrão,
a paginação vem configurada como 20. Portanto se quiser testar sem
 ter que criar mais de 20 posts, altere a opção `pageSize`
 para o valor que deseja. */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function getPagination() {
    const response = await fetch(nextPage).then((data) => data.json());

    const postData = response.results.map((post) => {
      return {
        uid: post.uid,
        data: post.data,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd MMM yyyy",
          {
            locale: ptBR,
          }
        ),
      };
    });

    setPosts([...posts, ...postData]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Header />
      <Head>
        <title>Home</title>
      </Head>

      <main className={commonStyles.postsContainer}>
        {posts.map((post: Post) => (
          <div className={`${styles.post}`} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
              </a>
            </Link>

            <p>{post.data.subtitle}</p>
            <div>
              <p>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM yyyy",
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <FiUser /> {post.data.author}
              </p>
            </div>
          </div>
        ))}

        {nextPage && (
          <div className={styles.readingMore}>
            <button type="button" onClick={getPagination}>
              Carregar mais posts
            </button>
          </div>
        )}
        {preview && <ExitPreviewButton />}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["posts.title", "posts.subtitle", "posts.author"],
      pageSize: 3,
      ref: previewData?.ref ?? null,
    }
  );

  const results = postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      data: post.data,
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
      preview,
    },
  };
};
