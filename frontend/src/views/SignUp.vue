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
				><a-col><h1>Sign Up</h1></a-col></a-row
			>
			<a-row type="flex" justify="center">
				<a-col span="20">
					<Error v-if="error" :error="error" />
					<a-form-model
						ref="signUpForm"
						:model="form"
						:label-col="labelCol"
						:wrapper-col="wrapperCol"
						:rules="rules"
					>
						<a-form-model-item label="Username" required prop="username" hasFeedback
							><a-input v-model="form.username" placeholder="Username"></a-input
						></a-form-model-item>
						<a-form-model-item label="Email" required prop="email" hasFeedback
							><a-input v-model="form.email" placeholder="Email" type="email"
						/></a-form-model-item>
						<a-form-model-item label="Password" required prop="password" hasFeedback
							><a-input
								v-model="form.password"
								placeholder="Password"
								type="password"
								autocomplete="off"
						/></a-form-model-item>
						<a-form-model-item label="Confirm Password" required prop="confirmPassword" hasFeedback
							><a-input
								v-model="form.confirmPassword"
								placeholder="Confirm Password"
								type="password"
								autocomplete="off"
						/></a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button type="primary" @click="handleSubmit">
								Create
							</a-button>
							<a-button style="margin-left: 10px;" @click.prevent="resetForm">Clear</a-button>
						</a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<strong>OR</strong>
						</a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button :href="googleUrl">Sign up with Google</a-button>
						</a-form-model-item>
					</a-form-model>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { signUp, signOut, getGoogleAuthUrl } from '../yolo-client'
import Error from '../components/Error'

export default {
	props: ['user'],
	components: {
		Error,
	},
	data() {
		return {
			error: null,
			googleUrl: null,
			labelCol: { span: 5 },
			wrapperCol: { span: 14 },
			form: {
				username: '',
				email: '',
				password: '',
				confirmPassword: '',
			},
			rules: {
				username: [
					{ required: true, message: 'Please input Username' },
					{ min: 3, max: 14, message: 'Length should be 3 to 14' },
				],
				email: [
					{ required: true, message: 'Please input Email' },
					{ type: 'email', message: 'The input is not valid E-mail!' },
				],
				password: [
					{ required: true, message: 'Please input Password' },
					{ min: 8, max: 16, message: 'Length should be 8 to 16 characters' },
				],
				confirmPassword: [
					{ required: true, message: 'Please confirm Password' },
					{ min: 8, max: 16, message: 'Length should be 8 to 16 characters' },
					{ validator: this.validatePass, trigger: ['change', 'blur'] },
				],
			},
		}
	},
	mounted: function() {
		this.$emit('update:selectedKeys', [this.$router.currentRoute.path])
	},
	methods: {
		resetForm() {
			this.$refs.signUpForm.resetFields()
		},
		validatePass(rule, value, callback) {
			if (value !== this.form.password) {
				callback("Passwords don't match!")
			} else {
				callback()
			}
		},
		handleSubmit() {
			this.$refs.signUpForm.validate((valid) => {
				if (valid) {
					signUp(this.form.username, this.form.email, this.form.password)
						.then((res) => {
							this.$emit('update:user', res.data)
							this.$router.push('/')
						})
						.catch((err) => {
							if (err === 'Your email is blacklisted') {
								this.$refs.signUpForm.resetFields()
							}
							this.error = err
						})
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
	},
	created: async function() {
		if (this.user.id) {
			await signOut()
		}
		await getGoogleAuthUrl()
			.then((res) => (this.googleUrl = res))
			.catch((err) => console.log(err))
	},
}
</script>
<style scoped></style>
