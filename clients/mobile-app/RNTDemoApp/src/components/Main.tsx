/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import {COLOR, SPACING} from '../theme';
import BlogItem from './Blog';
import type {Blog} from '../../../../../common/src/services/types';
import {API_URL} from '@env';

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  header: {
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: COLOR.background,
    paddingHorizontal: SPACING.base,
    width: '100%',
    paddingTop: 20,
    paddingBottom: 20,
  },
  heading: {
    color: COLOR.onPrimary,
    fontSize: 20,
    alignSelf: 'center',
  },
  subheading: {
    color: COLOR.onPrimary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 'bold',
  },
  separator: {
    alignSelf: 'center',
    width: '20%',
    borderWidth: 0.3,
    borderStyle: 'dashed',
    borderRadius: 1,
    borderColor: 'black',
    marginVertical: 20,
  },
  activityIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

const Main = () => {
  const [isLoading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState<Blog[]>();
  const [message, setMessage] = useState('');

  console.log('API_URL: ', API_URL);
  //const endpoint = API_URL;
  const headers = {
    'content-type': 'application/json',
  };
  const graphqlQuery = {
    //operationName: 'allBlogs',
    query:
      'query { allBlogs { id, title, author, publishDate, imageUrl, guidUrl, tags } }',
    variables: {},
  };
  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(graphqlQuery),
  };

  const fetchBlogs = async () => {
    let data;
    try {
      const response = await fetch(API_URL, options);
      if (response.status >= 200 && response.status <= 299) {
        data = await response.json();
      } else {
        console.log('HTTP response status: ', response.status);
        setMessage('Could not load data.');
        setLoading(false);
      }
      //console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      if (data) {
        setBlogs(data.data.allBlogs);
        setMessage('');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const sortedBlogs = blogs
    ? blogs.sort(
        (a, b) =>
          new Date(b.publishDate.toString()).getTime() -
          new Date(a.publishDate.toString()).getTime(),
      )
    : [];
  const ItemDivider = () => {
    return <View style={styles.separator} />;
  };

  const renderBlog = ({item}) => <BlogItem blog={item} />;

  return (
    <SafeAreaView style={styles.maincontainer}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          <Text style={styles.bold}>Polar Squad</Text> on Medium
        </Text>
        <Text style={styles.subheading}>
          Sharing stories from the DevOps world
        </Text>
      </View>
      <ActivityIndicator
        size="large"
        color={COLOR.hightlight}
        animating={isLoading}
        style={styles.activityIndicator}
      />
      {message !== '' && <Text>{message}</Text>}
      {sortedBlogs && (
        <FlatList
          data={sortedBlogs}
          renderItem={renderBlog}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={ItemDivider}
          extraData={isLoading}
        />
      )}
    </SafeAreaView>
  );
};

export default Main;
