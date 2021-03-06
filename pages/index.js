import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const defaultEndpoint = 'https://rickandmortyapi.com/api/character/';

export async function getServerSideProps() {
  const res = await fetch(defaultEndpoint);
  const data = await await res.json();

  return {
    props: {
      data
    }
  }
}

export default function Home({ data }) {
  const { info, results: defaultResults = [] } = data;
  const [results, updateResults] = useState(defaultResults);
  const [page, updatePage] = useState({
    ...info,
    current: defaultEndpoint
  });
  const [errorMessage, updateError] = useState('');
  const { current } = page;

  useEffect(() => {
    if ( current === defaultEndpoint ) return;
  
    async function request() {
      const res = await fetch(current);
      const nextData = await res.json();
  
      updateError(err => {
        return [
          err
        ]
      });

      if ( res.status === 404 ) {
        updateError('Sorry no results.');
      } else {
        updateError('');
      }

      updatePage({
        current,
        ...nextData.info
      });
  
      if ( !nextData.info?.prev ) {
        updateResults(nextData.results);
        return;
      }
  
      updateResults(prev => {
        return [
          ...prev,
          ...nextData.results
        ]
      });
    }
  
    request();
  }, [current]);

  function handleLoadMore() {
    updatePage(prev => {
      return {
        ...prev,
        current: page?.next
      }            
    });
  }

  function handleSubmitSearch(e) {
    e.preventDefault();

    const { currentTarget  = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find(field => field.name === 'query');

    const value = fieldQuery.value || '';
    const endpoint = `https://rickandmortyapi.com/api/character/?name=${value}`

    updatePage({
      current: endpoint
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Rick and Morty Wiki</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Rick and Morty Character Wiki
        </h1>

        <p className={styles.description}>
          Feel free to search or browse characters.
        </p>

        <form className={styles.search} onSubmit={handleSubmitSearch}>
          <input name="query" type="search" />
          <button>Search</button>          
        </form>
        
        <p className={styles.error}>
          { errorMessage }
        </p>

        <ul className={styles.grid}>
          {results?.map(result => {
            const { id, name, image } = result;

            return (
              <li key = { id } className={styles.card}>
                <Link href="/character/[id]" as={`/character/${id}`}>
                  <a href="https://nextjs.org/docs">
                    <img src={image} alt={`${name}`}/>
                    <h3>{name}</h3>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>

        {results ? 
            <p>
              <button onClick={handleLoadMore}>Load More</button>
            </p>
          : ''
        }
       
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
