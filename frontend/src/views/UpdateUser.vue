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
        ><a-col><h1>Update User</h1></a-col></a-row
      >
      <a-row type="flex" justify="center">
        <a-col span="20">
          <a-form-model
            :model="form"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="rules"
          >
            <a-form-model-item label="Username" required hasFeedback
              ><a-input v-model="form.username" placeholder="Current Username"
            /></a-form-model-item>
            <a-form-model-item
              label="Password"
              required
              prop="Password"
              hasFeedback
              ><a-input
                v-model="form.password"
                placeholder="Current Password"
                type="password"
            /></a-form-model-item>
            <a-form-model-item
              label="Confirm Password"
              required
              prop="confirmPassword"
              hasFeedback
              ><a-input
                v-model="form.confirmPassword"
                placeholder="Current password"
                type="password"
                autocomplete="off"
            /></a-form-model-item>
            <a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
              <a-button type="primary" @click="handleSubmit">
                Sign In
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
export default {
  data() {
    return {
      labelCol: { span: 5 },
      wrapperCol: { span: 14 },
      form: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      rules: {
        username: [
          { required: true, message: "Please input Username" },
          { min: 3, max: 14, message: "Length should be 3 to 14" },
        ],
        password: [
          { required: true, message: "Please input Password" },
          { min: 8, max: 16, message: "Length should be 8 to 16 characters" },
        ],
        confirmPassword: [
          { required: true, message: "Please confirm Password" },
          { min: 8, max: 16, message: "Length should be 8 to 16 characters" },
          { validator: this.validatePass, trigger: "change" },
        ],
      },
    };
  },
  methods: {
    validatePass(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error("Passwords don't match!"));
      } else {
        callback();
      }
    },
  },
};
</script>
