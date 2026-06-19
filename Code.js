/**
 * Google Apps Script Web App - Backend (Code.js)
 * 架空のSNSアプリ「Echoes」
 */

// Web Appののエントリーポイント
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Echoes - Fictional SNS')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 投稿データを格納するスクリプトプロパティのキー
 */
var POSTS_PROPERTY_KEY = 'ECHOES_POSTS_DATA';

/**
 * 初期テスト用データ
 */
var DEFAULT_POSTS = [
  {
    id: 'post_1',
    username: 'シノハラ・レイ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    handle: '@ray_shino',
    content: '新しく開発したGASのウェブアプリケーションのUIがいい感じ！Glassmorphismを取り入れてプレミアム感を出してみました。✨ #GAS #WebDesign',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2時間前
    likes: 12,
    likedBy: [],
    comments: [
      {
        id: 'comment_1_1',
        username: 'タカハシ・コウキ',
        handle: '@koki_taka',
        content: 'めちゃくちゃかっこいいですね！レスポンシブですか？',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ]
  },
  {
    id: 'post_2',
    username: 'タカハシ・コウキ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    handle: '@koki_taka',
    content: '今日は一日中、新しいプログラミング言語の勉強をしていました。やはり基礎を学び直すのは大切ですね。💻 #勉強垢 #エンジニア',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5時間前
    likes: 8,
    likedBy: [],
    comments: []
  },
  {
    id: 'post_3',
    username: 'ミナミ・サクラ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    handle: '@sakura_m',
    content: 'カフェでデザインのラフスケッチを作成中。やっぱりおいしいコーヒーがあると作業がはかどります。☕️🎨 #Design #Creative',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8時間前
    likes: 24,
    likedBy: [],
    comments: []
  }
];

/**
 * 投稿一覧を取得する
 */
function getPosts() {
  try {
    var properties = PropertiesService.getScriptProperties();
    var data = properties.getProperty(POSTS_PROPERTY_KEY);
    if (!data) {
      // データがない場合は初期データをセット
      properties.setProperty(POSTS_PROPERTY_KEY, JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('getPosts error: ' + e.toString());
    return DEFAULT_POSTS; // エラー時は初期データを返す
  }
}

/**
 * 新しい投稿を作成する
 */
function createPost(username, handle, avatar, content) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var posts = getPosts();
    
    var newPost = {
      id: 'post_' + Date.now(),
      username: username,
      handle: handle,
      avatar: avatar,
      content: content,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };
    
    posts.unshift(newPost); // 先頭に追加
    properties.setProperty(POSTS_PROPERTY_KEY, JSON.stringify(posts));
    return posts;
  } catch (e) {
    console.error('createPost error: ' + e.toString());
    throw new Error('投稿の作成に失敗しました: ' + e.toString());
  }
}

/**
 * 投稿に「いいね！」をする
 */
function likePost(postId, userHandle) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var posts = getPosts();
    
    var updated = false;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === postId) {
        if (!posts[i].likedBy) {
          posts[i].likedBy = [];
        }
        
        var index = posts[i].likedBy.indexOf(userHandle);
        if (index === -1) {
          // いいねを追加
          posts[i].likedBy.push(userHandle);
          posts[i].likes = posts[i].likedBy.length;
        } else {
          // いいねを解除
          posts[i].likedBy.splice(index, 1);
          posts[i].likes = posts[i].likedBy.length;
        }
        updated = true;
        break;
      }
    }
    
    if (updated) {
      properties.setProperty(POSTS_PROPERTY_KEY, JSON.stringify(posts));
    }
    return posts;
  } catch (e) {
    console.error('likePost error: ' + e.toString());
    throw new Error('いいねの更新に失敗しました: ' + e.toString());
  }
}

/**
 * 投稿にコメントを追加する
 */
function addComment(postId, username, handle, commentText) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var posts = getPosts();
    
    var updated = false;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === postId) {
        var newComment = {
          id: 'comment_' + Date.now(),
          username: username,
          handle: handle,
          content: commentText,
          timestamp: new Date().toISOString()
        };
        if (!posts[i].comments) {
          posts[i].comments = [];
        }
        posts[i].comments.push(newComment);
        updated = true;
        break;
      }
    }
    
    if (updated) {
      properties.setProperty(POSTS_PROPERTY_KEY, JSON.stringify(posts));
    }
    return posts;
  } catch (e) {
    console.error('addComment error: ' + e.toString());
    throw new Error('コメントの追加に失敗しました: ' + e.toString());
  }
}

/**
 * データをリセットする（デバッグ用）
 */
function resetData() {
  try {
    var properties = PropertiesService.getScriptProperties();
    properties.setProperty(POSTS_PROPERTY_KEY, JSON.stringify(DEFAULT_POSTS));
    return DEFAULT_POSTS;
  } catch (e) {
    console.error('resetData error: ' + e.toString());
    throw new Error('データのリセットに失敗しました: ' + e.toString());
  }
}
