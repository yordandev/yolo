<template>
  <a-layout-content style="margin: 0 16px">
    <a-breadcrumb style="margin: 16px 0">
      <a-breadcrumb-item><a href="../Home.vue">Home</a></a-breadcrumb-item
      ><a-breadcrumb-item>Account</a-breadcrumb-item
      ><a-breadcrumb-item>My Profile</a-breadcrumb-item></a-breadcrumb
    >
    <div
      :style="{
        padding: '24px',
        background: '#fff',
        minHeight: '360px',
      }"
    >
      <a-row type="flex" align="middle">
        <a-col>
          <h1>Welcome Username!</h1>
          <h3>The information here is only visible to you.</h3>
          <p><strong>Email:</strong>username@email.com</p>
          <a-space>
            <a-button>Delete your Account</a-button>
            <a-button type="primary">Update your Information</a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>
  </a-layout-content>
</template>

<script>
// @ is an alias to /src

export default {};
</script>
<style scoped></style>
