<template>
  <a-layout-content style="margin: 0 16px">
    <a-breadcrumb style="margin: 16px 0"> </a-breadcrumb>
    <div
      :style="{
        padding: '24px',
        background: '#fff',
        minHeight: '360px',
      }"
    >
      <a-row type="flex" justify="center"
        ><a-col><h1>Create Account</h1></a-col></a-row
      >
      <a-row type="flex" justify="center">
        <a-col span="20">
          <a-form-model
            model="form"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-form-model-item label="Username"
              ><a-input v-model="form.username" placeholder="Username"
            /></a-form-model-item>
            <a-form-model-item label="Email"
              ><a-input v-model="form.email" placeholder="Email"
            /></a-form-model-item>
            <a-form-model-item label="Password"
              ><a-input
                v-model="form.password"
                placeholder="Password"
                type="password"
            /></a-form-model-item>
            <a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
              <a-button type="primary" @click="handleSubmit">
                Create
              </a-button>
              <a-button style="margin-left: 10px;"
                ><router-link to="/"> Cancel</router-link>
              </a-button>
            </a-form-model-item>
          </a-form-model>
        </a-col>
      </a-row>
    </div>
  </a-layout-content>
</template>

<script>
// @ is an alias to /src

export default {
  data() {
    return {
      labelCol: { span: 5 },
      wrapperCol: { span: 14 },
      form: {
        username: "",
        email: "",
        password: "",
      },
    };
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      console.log(this.form);
    },
  },
};
</script>
<style scoped></style>
