import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home() {
  return (
    <>
      <Header/>
      </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
