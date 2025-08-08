#!/usr/bin/env node

/**
 * FitShare リグレッションテスト
 * 全機能の動作確認を自動化
 */

const fetch = require('cross-fetch');
const fs = require('fs');
const path = require('path');

class RegressionTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.testResults = [];
    this.testUser = {
      email: 'test@fitshare.com',
      password: 'test123',
      username: 'TestUser'
    };
    this.authToken = null;
    this.userId = null;
    this.createdPostId = null;
    this.targetUserId = null; // 他ユーザーのテスト用
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '🔍',
      'success': '✅', 
      'error': '❌',
      'warning': '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    this.testResults.push({
      timestamp,
      type,
      message,
      passed: type === 'success'
    });
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      const data = await response.json().catch(() => null);
      
      return {
        status: response.status,
        ok: response.ok,
        data,
        headers: response.headers
      };
    } catch (error) {
      this.log(`Request failed: ${error.message}`, 'error');
      return { status: 0, ok: false, error: error.message };
    }
  }

  async test(name, testFn) {
    this.log(`Testing: ${name}`, 'info');
    try {
      await testFn();
      this.log(`✓ ${name}`, 'success');
    } catch (error) {
      this.log(`✗ ${name}: ${error.message}`, 'error');
    }
  }

  // =====================================
  // 認証・ユーザー管理テスト
  // =====================================
  
  async testUserRegistration() {
    await this.test('User Registration', async () => {
      const response = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(this.testUser)
      });

      if (!response.ok && response.status !== 400) { // 既存ユーザーなら400でもOK
        throw new Error(`Registration failed: ${response.status}`);
      }
      
      if (response.ok) {
        this.authToken = response.data.token;
        this.userId = response.data.user.id;
      }
    });
  }

  async testUserLogin() {
    await this.test('User Login', async () => {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testUser.email,
          password: this.testUser.password
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.authToken = response.data.token;
      this.userId = response.data.user.id;
    });
  }

  async testGetUserProfile() {
    await this.test('Get User Profile', async () => {
      const response = await this.request(`/api/users/${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`Get profile failed: ${response.status}`);
      }

      const user = response.data;
      if (!user.username || !user.email) {
        throw new Error('Profile missing required fields');
      }

      // フォロー数の確認
      if (typeof user.followingCount !== 'number' || typeof user.followerCount !== 'number') {
        throw new Error('Profile missing follow counts');
      }
    });
  }

  // =====================================
  // 投稿機能テスト
  // =====================================

  async testCreatePost() {
    await this.test('Create Post', async () => {
      const postData = {
        exercises: JSON.stringify([{
          exercise: 'ベンチプレス',
          sets: [
            { weight: 60, reps: 10 },
            { weight: 65, reps: 8 }
          ]
        }]),
        comment: 'テスト投稿です',
        workoutDate: new Date().toISOString().split('T')[0]
      };

      const response = await this.request('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`Create post failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.createdPostId = response.data._id;
      
      if (!response.data.exercises || response.data.exercises.length === 0) {
        throw new Error('Post missing exercises data');
      }
    });
  }

  async testGetPosts() {
    await this.test('Get Following Posts', async () => {
      const response = await this.request('/api/posts/following');
      
      if (!response.ok) {
        throw new Error(`Get posts failed: ${response.status}`);
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Posts response is not an array');
      }
    });
  }

  async testUpdatePost() {
    await this.test('Update Post', async () => {
      if (!this.createdPostId) {
        throw new Error('No post to update');
      }

      const updateData = {
        exercises: JSON.stringify([{
          exercise: 'ベンチプレス',
          sets: [
            { weight: 70, reps: 10 },
            { weight: 75, reps: 8 }
          ]
        }]),
        comment: '更新されたテスト投稿です'
      };

      const response = await this.request(`/api/posts/${this.createdPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Update post failed: ${response.status}`);
      }
    });
  }

  async testLikePost() {
    await this.test('Like Post', async () => {
      if (!this.createdPostId) {
        throw new Error('No post to like');
      }

      const response = await this.request(`/api/posts/${this.createdPostId}/like`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Like post failed: ${response.status}`);
      }

      if (typeof response.data.likes !== 'number') {
        throw new Error('Like response missing likes count');
      }
    });
  }

  // =====================================
  // フォロー機能テスト
  // =====================================

  async testGetAllUsers() {
    await this.test('Get All Users for Follow Test', async () => {
      const response = await this.request('/api/search/users?q=');
      
      if (!response.ok) {
        // 全ユーザー取得の別の方法を試す
        const response2 = await this.request('/api/posts/all');
        if (response2.ok && response2.data.length > 0) {
          // 投稿から他のユーザーを見つける
          const otherUser = response2.data.find(post => 
            post.userId && (typeof post.userId === 'object' ? post.userId._id : post.userId) !== this.userId
          );
          
          if (otherUser) {
            this.targetUserId = typeof otherUser.userId === 'object' ? otherUser.userId._id : otherUser.userId;
            return;
          }
        }
        throw new Error('Cannot find other users for follow test');
      }

      const users = response.data.users || [];
      const otherUser = users.find(user => user.id !== this.userId);
      
      if (!otherUser) {
        throw new Error('No other users found for follow test');
      }

      this.targetUserId = otherUser.id;
    });
  }

  async testFollowUser() {
    await this.test('Follow User', async () => {
      if (!this.targetUserId) {
        throw new Error('No target user for follow test');
      }

      const response = await this.request(`/api/follow/${this.targetUserId}`, {
        method: 'POST'
      });

      // 既にフォローしている場合は400でもOK
      if (!response.ok && response.status !== 400) {
        throw new Error(`Follow user failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testGetFollowStatus() {
    await this.test('Get Follow Status', async () => {
      if (!this.targetUserId) {
        throw new Error('No target user for follow status test');
      }

      const response = await this.request(`/api/user/${this.targetUserId}/follow-status`);
      
      if (!response.ok) {
        throw new Error(`Get follow status failed: ${response.status}`);
      }

      if (typeof response.data.isFollowing !== 'boolean') {
        throw new Error('Follow status response missing isFollowing field');
      }
    });
  }

  async testGetFollowingList() {
    await this.test('Get Following List', async () => {
      const response = await this.request(`/api/user/${this.userId}/following`);
      
      if (!response.ok) {
        throw new Error(`Get following list failed: ${response.status}`);
      }

      if (!Array.isArray(response.data.following)) {
        throw new Error('Following list response is not an array');
      }
    });
  }

  async testGetFollowersList() {
    await this.test('Get Followers List', async () => {
      const response = await this.request(`/api/user/${this.userId}/followers`);
      
      if (!response.ok) {
        throw new Error(`Get followers list failed: ${response.status}`);
      }

      if (!Array.isArray(response.data.followers)) {
        throw new Error('Followers list response is not an array');
      }
    });
  }

  async testUserSearch() {
    await this.test('User Search', async () => {
      const response = await this.request('/api/search/users?q=Test');
      
      if (!response.ok) {
        throw new Error(`User search failed: ${response.status}`);
      }

      if (!Array.isArray(response.data.users)) {
        throw new Error('Search response is not an array');
      }
    });
  }

  // =====================================
  // コメント機能テスト
  // =====================================

  async testAddComment() {
    await this.test('Add Comment', async () => {
      if (!this.createdPostId) {
        throw new Error('No post to comment on');
      }

      const response = await this.request(`/api/posts/${this.createdPostId}/comment`, {
        method: 'POST',
        body: JSON.stringify({
          text: 'これはテストコメントです'
        })
      });

      if (!response.ok) {
        throw new Error(`Add comment failed: ${response.status}`);
      }

      if (!response.data.comments || response.data.comments.length === 0) {
        throw new Error('Comment was not added to post');
      }
    });
  }

  // =====================================
  // システム機能テスト
  // =====================================

  async testHealthCheck() {
    await this.test('Health Check', async () => {
      const response = await this.request('/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      if (response.data.status !== 'ok') {
        throw new Error('Health check status is not ok');
      }
    });
  }

  // =====================================
  // クリーンアップ
  // =====================================

  async cleanup() {
    this.log('Starting cleanup...', 'info');
    
    // 作成した投稿を削除
    if (this.createdPostId) {
      await this.test('Delete Test Post', async () => {
        const response = await this.request(`/api/posts/${this.createdPostId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Delete post failed: ${response.status}`);
        }
      });
    }

    this.log('Cleanup completed', 'info');
  }

  // =====================================
  // メインテスト実行
  // =====================================

  async runAllTests() {
    console.log('🚀 Starting FitShare Regression Tests...\n');
    
    try {
      // システム機能テスト
      await this.testHealthCheck();
      
      // 認証・ユーザー管理テスト
      await this.testUserRegistration();
      await this.testUserLogin();
      await this.testGetUserProfile();
      
      // 投稿機能テスト
      await this.testCreatePost();
      await this.testGetPosts();
      await this.testUpdatePost();
      await this.testLikePost();
      
      // コメント機能テスト
      await this.testAddComment();
      
      // フォロー機能テスト
      await this.testGetAllUsers();
      await this.testFollowUser();
      await this.testGetFollowStatus();
      await this.testGetFollowingList();
      await this.testGetFollowersList();
      await this.testUserSearch();
      
      // クリーンアップ
      await this.cleanup();
      
    } catch (error) {
      this.log(`Unexpected error: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.filter(r => r.type === 'success' || r.type === 'error').length;
    const passedTests = this.testResults.filter(r => r.type === 'success').length;
    const failedTests = this.testResults.filter(r => r.type === 'error').length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => r.type === 'error')
        .forEach(r => console.log(`   - ${r.message}`));
    }

    // レポートをファイルに保存
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1)
      },
      results: this.testResults
    };

    fs.writeFileSync('regression-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed report saved to: regression-test-report.json');
    
    // 終了コード設定
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// サーバーが起動しているかチェック
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3001/health');
    return response.ok;
  } catch {
    return false;
  }
}

// メイン実行
async function main() {
  console.log('🔍 Checking server status...');
  
  const isServerRunning = await checkServerStatus();
  if (!isServerRunning) {
    console.log('❌ Server is not running on localhost:3001');
    console.log('💡 Please start the server first: node server.js');
    process.exit(1);
  }

  console.log('✅ Server is running, starting tests...\n');
  
  const tester = new RegressionTester();
  await tester.runAllTests();
}

// コマンドライン引数の処理
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = RegressionTester;