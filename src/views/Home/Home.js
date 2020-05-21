import React, { useEffect, useState } from 'react';
import {
  EuiPanel,
  EuiSpacer,
  EuiImage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiBadge
} from '@elastic/eui';
import { instance } from '@@/api';
import styles from './index.module.scss';

const News = props => {
  const { news } = props;
  const openNews = () => {
    window.open(news.url);
  };
  return (
    <>
      <EuiPanel onClick={openNews} hasShadow>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiImage
              className={styles.image}
              url={news.imgsrc}
              size="250px"
              alt={news.title}></EuiImage>
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiTitle size="xs">
              <h4>{news.title}</h4>
            </EuiTitle>
            <p title={news.digest} className={styles.digest}>
              {news.digest}
            </p>
            <p>
              <EuiBadge>{news.source}</EuiBadge>
              <EuiBadge>{news.mtime}</EuiBadge>
            </p>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <EuiSpacer size="m"></EuiSpacer>
    </>
  );
};

const Home = props => {
  const [newsList, setNewsList] = useState([]);
  const fetchNews = async () => {
    let res = await instance.get('/bulletin/index');
    const { newslist } = res;
    setNewsList(newslist);
  };
  useEffect(() => {
    fetchNews();
  }, []);
  return (
    <EuiFlexGroup justifyContent="center">
      <EuiFlexItem style={{ maxWidth: 600 }}>
        {newsList.map((n, index) => (
          <News key={index} news={n}></News>
        ))}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default Home;
