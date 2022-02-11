import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Next App with CDK</h1>
      </main>
      <h6>&copy; Marco :D</h6>
    </div>
  )
}

export default Home
