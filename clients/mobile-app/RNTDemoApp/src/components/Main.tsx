import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  Text,
} from 'react-native';
import {COLOR, SPACING} from '../theme';
import Blog from './Blog';

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
});

const Main = () => {
  const blogs = [
    {
      id: 1,
      title: 'Do you need Kubernetes?',
      author: 'Risto Laurikainen',
      publishDate: 'Jun 21, 2021',
      imageUrl: 'https://cdn-images-1.medium.com/max/1024/0*xHdSIJIR906ShgCz',
      guidUrl: 'https://medium.com/p/34ae206c2866',
      tags: 'cloud-computing, devops, kubernetes, containers',
    },
    {
      id: 2,
      title: 'Why you need a platform team for Kubernetes',
      author: 'Risto Laurikainen',
      publishDate: 'Mar 22, 2021',
      imageUrl: 'https://cdn-images-1.medium.com/max/1024/0*lJd9V9QxeJEK5jRb',
      guidUrl: 'https://medium.com/p/6235b044bedd',
      tags: 'information-technology, kubernetes, computing, cloud, teamwork',
    },
    {
      id: 3,
      title: 'Our willingness to create change sets Polar Squad apart',
      author: 'Joska Pyykkö',
      publishDate: 'Mar 22, 2021',
      imageUrl:
        'https://cdn-images-1.medium.com/max/1024/1*TXcNnfk-eUOlgnlrz63iwA.jpeg',
      guidUrl: 'https://medium.com/p/c5769e53b51c',
      tags: 'devops',
    },
  ];

  const ItemDivider = () => {
    return <View style={styles.separator} />;
  };

  const renderBlog = ({item}) => <Blog blog={item} />;

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
      <FlatList
        data={blogs}
        renderItem={renderBlog}
        keyExtractor={blog => blog.id}
        ItemSeparatorComponent={ItemDivider}
      />
    </SafeAreaView>
  );
};

export default Main;
