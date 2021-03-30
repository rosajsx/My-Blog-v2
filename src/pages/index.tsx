import { GetStaticProps } from 'next';
import Header from '../components/Header';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';

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
}

/* - **src/pages/index.tsx**: Utilizar o método `query`
para retornar todos os `posts` já com paginação. Por padrão,
a paginação vem configurada como 20. Portanto se quiser testar sem
 ter que criar mais de 20 posts, altere a opção `pageSize`
 para o valor que deseja. */

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function getPagination() {
    const response = await fetch(nextPage).then(data => data.json());

    const postData = response.results.map(post => {
      return {
        uid: post.uid,
        data: post.data,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
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
                <time>{post.first_publication_date}</time>
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
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: post.data,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  //console.log(posts);
  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
