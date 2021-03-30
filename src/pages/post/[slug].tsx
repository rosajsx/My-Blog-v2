import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

/*
- **src/pages/posts/[slug.tsx]**: Utilizar o método `query`
 para buscar todos os `posts` e o `getByUID` para buscar as
 informações do `post` específico.
 */

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div>
        <h1>Carregando...</h1>
      </div>
    );
  }

  function getReadingTime() {
    const writte_human_limit_per_minutes = 200;

    const letters = post?.data?.content.reduce((acc, item) => {
      // Garantindo que heading exista
      let heading = `${item.heading}`;
      // Quebrando em palavras por espaço
      acc.push(...heading.split(' '));

      // Limpa espaços em branco, linhas novas, inicio e fim da string.
      const bodyLetter = RichText.asText(item.body)
        .replace(/[^\w|\s]/g, '')
        .split(' ');

      acc.push(...bodyLetter);

      return acc;
    }, []);

    const rateInSeconds = Math.ceil(
      letters.length / writte_human_limit_per_minutes
    );

    return rateInSeconds;
  }

  return (
    <div>
      <Header />

      <img
        style={{ height: '400px', width: '100%' }}
        src={post.data.banner.url}
        alt="banner"
      />

      <main className={styles.container}>
        <article className={styles.postContainer}>
          <header>
            <h1>{post.data.title}</h1>
            <p>
              <time>
                <FiCalendar />{' '}
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> {getReadingTime()} min
              </span>
            </p>
          </header>

          <div className={styles.postContent}>
            {post.data.content.map((data, index) => (
              <div key={index}>
                <h2>{data.heading}</h2>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(data.body),
                  }}
                ></div>
              </div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 100,
    }
  );
  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return {
    props: {
      post,
    },
  };
};
