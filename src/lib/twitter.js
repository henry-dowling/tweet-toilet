import { TwitterApi } from 'twitter-api-v2';

export class TwitterHandler {
  constructor(credentials) {
    this.client = new TwitterApi(credentials);
  }

  async sendTweet(text) {
    try {
      const tweet = await this.client.v2.tweet(text);
      return tweet.data;
    } catch (error) {
      console.error('Error sending tweet:', error);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const user = await this.client.v2.me();
      return user.data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  async getRecentTweets(count = 10) {
    try {
      const tweets = await this.client.v2.userTimeline('me', {
        max_results: count,
        'tweet.fields': ['created_at', 'public_metrics']
      });
      return tweets.data.data;
    } catch (error) {
      console.error('Error getting recent tweets:', error);
      throw error;
    }
  }
} 