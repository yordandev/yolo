<template>
  <a-layout id="components-layout-demo-side" style="min-height: 100vh">
    <a-layout-sider v-model="collapsed" collapsible>
      <div class="logo" />
      <a-menu theme="dark" :default-selected-keys="['1']" mode="inline">
        <a-menu-item key="1">
          <router-link to="/">
            <a-icon type="home" />
            <span>Home</span></router-link
          >
        </a-menu-item>
        <a-menu-item key="2">
          <router-link to="/posts">
            <a-icon type="robot" />
            <span>Posts</span></router-link
          >
        </a-menu-item>
        <a-menu-item key="3">
          <router-link to="/create-post">
            <a-icon type="plus-circle" />
            <span>Create Post</span></router-link
          >
        </a-menu-item>
        <a-sub-menu key="sub1">
          <span slot="title"><a-icon type="user" /><span>Account</span></span>
          <a-menu-item key="4">
            <router-link to="/my-profile"> My Profile</router-link>
          </a-menu-item>
          <a-menu-item key="5">
            <router-link to="/my-posts"> My Posts</router-link>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header align="end">
        <a-space size="large">
          <a-button type="primary">
            Sign Out
          </a-button>
          <a-button type="primary"
            ><router-link to="/sign-in"> Sign In</router-link>
          </a-button>
          <a-button type="primary"
            ><router-link to="/create-account"> Create Account</router-link>
          </a-button>
        </a-space>
      </a-layout-header>
      <router-view></router-view>
      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data() {
    return {
      collapsed: false,
    };
  },
};
</script>

<style>
#components-layout-demo-side .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
h1 {
  font-size: 36px;
}
h2 {
  font-size: 28px;
}
h3 {
  font-size: 20px;
}
p {
  font-size: 14px;
}
</style>
