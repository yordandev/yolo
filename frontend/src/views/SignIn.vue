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
				><a-col><h1>Sign In</h1></a-col></a-row
			>
			<a-row type="flex" justify="center">
				<a-col span="20">
					<Error v-if="error" :error="error" />
					<a-form-model
						ref="signInForm"
						:model="form"
						:label-col="labelCol"
						:wrapper-col="wrapperCol"
						:rules="rules"
					>
						<a-form-model-item label="Username" required prop="username" hasFeedback
							><a-input v-model="form.username" placeholder="Username"></a-input
						></a-form-model-item>
						<a-form-model-item label="Password" required prop="password" hasFeedback
							><a-input
								v-model="form.password"
								placeholder="Password"
								type="password"
								autocomplete="off"
						/></a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button type="primary" @click.prevent="handleSubmit">
								Sign In
							</a-button>
							<a-button style="margin-left: 10px;" @click.prevent="resetForm">Clear</a-button>
						</a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<strong>OR</strong>
						</a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button :href="googleUrl"
								><img
									class="google-icon"
									src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
								/>Sign in with Google</a-button
							>
						</a-form-model-item>
					</a-form-model>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>

<script>
import { signIn, signOut, getGoogleAuthUrl } from '../yolo-client'
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
				password: '',
			},
			rules: {
				username: [
					{ required: true, message: 'Please input Username' },
					{ min: 3, max: 14, message: 'Length should be 3 to 14' },
				],
				password: [
					{ required: true, message: 'Please input Password' },
					{ min: 8, max: 16, message: 'Length should be 8 to 16 characters' },
				],
			},
		}
	},
	mounted: function() {
		this.$emit('update:selectedKeys', [this.$router.currentRoute.path])
	},
	methods: {
		resetForm() {
			this.$refs.signInForm.resetFields()
		},
		handleSubmit() {
			this.$refs.signInForm.validate((valid) => {
				if (valid) {
					signIn(this.form.username, this.form.password)
						.then((res) => {
							this.$emit('update:user', res)
							this.$router.push('/')
						})
						.catch((err) => (this.error = err))
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
<style scoped>
.google-icon {
	margin-right: 14px;
	width: 18px;
	height: 18px;
}
</style>
