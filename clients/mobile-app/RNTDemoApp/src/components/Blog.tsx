import React from 'react';
import {StyleSheet, View, Text, Image, Pressable, Linking} from 'react-native';
import {COLOR} from '../theme';

const styles = StyleSheet.create({
  blog: {
    flex: 1,
    alignSelf: 'center',
    width: '90%',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
  },
  content: {
    alignSelf: 'center',
    width: '90%',
    textAlign: 'space-between',
    flex: 1,
    marginTop: 10,
    alignContent: 'flex-start',
  },
  imagecontainer: {
    flex: 1,
    height: 300,
  },
  textcontainer: {
    flex: 1,
    alignSelf: 'flex-start',
    flexGrow: 1,
  },
  buttoncontainer: {
    flex: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  text: {
    color: COLOR.onPrimary,
    fontSize: 14,
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
  image: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    color: COLOR.primary,
    fontSize: 20,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  highlight: {
    color: COLOR.hightlight,
    fontWeight: '600',
  },
  padding: {
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  line: {
    lineHeight: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#000000',
  },
  buttontext: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

const BlogItem = ({blog}) => {
  const onPress = async (url: string) => {
    await Linking.canOpenURL(url);
    Linking.openURL(url);
  };

  return (
    <View style={styles.blog}>
      <View style={styles.content}>
        <Image
          style={styles.image}
          source={{
            uri: blog.imageUrl,
          }}
        />
        <View style={styles.textcontainer}>
          <Text style={styles.title}>{blog.title}</Text>
          <Text style={styles.padding}>
            <Text style={styles.highlight}>Tags</Text>: {blog.tags.join(', ')}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.highlight}>Author</Text>: {blog.author}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.highlight}>Date</Text>:{' '}
            {new Date(blog.publishDate.toString()).toLocaleDateString('en-GB')}
          </Text>
        </View>
        <View style={styles.buttoncontainer}>
          <Pressable
            style={styles.button}
            onPress={() => onPress(blog.guidUrl)}>
            <Text style={styles.buttontext}>Read more</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default BlogItem;
