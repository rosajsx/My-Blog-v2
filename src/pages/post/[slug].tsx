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
import Link from 'next/link';
import { ExitPreviewButton } from '../../components/ExitPreviewButton/index';
import { Comments } from '../../components/Comments/index';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  preview: unknown;
  pagination: {
    nextPage: {
      title: string;
      href: string;
    };
    prevPage: {
      title: string;
      href: string;
    };
  };
}

/*
- **src/pages/posts/[slug.tsx]**: Utilizar o método `query`
 para buscar todos os `posts` e o `getByUID` para buscar as
 informações do `post` específico.
 */

export default function Post({ post, preview, pagination }: PostProps) {
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
      <Head>
        <title>{post.data.title}</title>
      </Head>
      {/* <img
        style={{ height: '400px', width: '100%' }}
        src={post.data.banner.url}
        alt="banner"
      /> */}

      <main className={commonStyles.container}>
        <article className={styles.postContainer}>
          <header>
            <h1>{post.data.title}</h1>
            <p>
              <time>
                <FiCalendar />{' '}
                {format(
                  new Date(post.first_publication_date ?? '2021-12-29'),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  }
                )}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> {getReadingTime()} min
              </span>
            </p>
            {post.first_publication_date !== post.last_publication_date && (
              <time>
                * Editado em {''}
                {format(
                  new Date(post.last_publication_date),
                  "dd MMM yyyy', ás' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </time>
            )}
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

          <Comments post={post} />

          {preview && <ExitPreviewButton />}
        </article>
        {(pagination.nextPage || pagination.prevPage) && (
          <section className={styles.nextPrev}>
            <h3>Outro Posts</h3>

            {pagination.prevPage ? (
              <Link href={pagination.prevPage.href}>
                <a>
                  <strong>{pagination.prevPage?.title}</strong>
                  <span>(Post anterior)</span>
                </a>
              </Link>
            ) : (
              <strong />
            )}

            {pagination.nextPage ? (
              <Link href={pagination.nextPage?.href}>
                <a>
                  <strong>{pagination.nextPage.title}</strong>
                  <span>(Próximo Post)</span>
                </a>
              </Link>
            ) : (
              <strong />
            )}
          </section>
        )}
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
  const paths = posts.results.map((post) => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: response.data,
  };

  const {
    results: [prevPage],
  } = await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
    after: response.id,
    orderings: '[document.first_publication_date desc]',
  });

  const {
    results: [nextPage],
  } = await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
    after: response.id,
    orderings: '[document.first_publication_date]',
  });

  const pagination = {
    nextPage: nextPage
      ? {
          title: nextPage.data.title,
          href: `/post/${nextPage.uid}`,
        }
      : null,
    prevPage: prevPage
      ? {
          title: prevPage.data.title,
          href: `/post/${prevPage.uid}`,
        }
      : null,
  };

  return {
    props: {
      post,
      preview,
      pagination: pagination,
    },
  };
};
