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
						ref="updateUserForm"
						:model="form"
						:label-col="labelCol"
						:wrapper-col="wrapperCol"
						:rules="rules"
					>
						<a-form-model-item label="Username" hasFeedback
							><a-input v-model="form.username"
						/></a-form-model-item>
						<a-form-model-item label="Password" prop="Password" hasFeedback
							><a-input v-model="form.password" placeholder="Password" type="password"
						/></a-form-model-item>
						<a-form-model-item label="Confirm Password" prop="confirmPassword" hasFeedback
							><a-input placeholder="Confirm password" type="password" autocomplete="off"
						/></a-form-model-item>
						<a-form-model-item :wrapper-col="{ span: 14, offset: 5 }">
							<a-button type="primary" @click.prevent="handleSubmit">
								Update
							</a-button>
							<a-button style="margin-left: 10px;" @click.prevent="resetForm">Clear</a-button>
						</a-form-model-item>
					</a-form-model>
				</a-col>
			</a-row>
		</div>
	</a-layout-content>
</template>
<script>
import { getMyUserDetails, updateMyProfile } from '../yolo-client'

export default {
	data() {
		return {
			labelCol: { span: 5 },
			wrapperCol: { span: 14 },
			form: {
				username: '',
				password: '',
			},
			rules: {
				username: [
					{ message: 'Please input Username' },
					{ min: 3, max: 14, message: 'Length should be 3 to 14' },
				],
				password: [
					{ message: 'Please input Password' },
					{ min: 8, max: 16, message: 'Length should be 8 to 16 characters' },
				],
				confirmPassword: [
					{ message: 'Please confirm Password' },
					{ min: 8, max: 16, message: 'Length should be 8 to 16 characters' },
					{ validator: this.validatePass, trigger: ['blur', 'change'] },
				],
			},
		}
	},
	methods: {
		resetForm() {
			this.$refs.updateUserForm.resetFields()
		},
		validatePass(rule, value, callback) {
			if (value !== this.form.password) {
				callback("Passwords don't match!")
			} else {
				callback()
			}
		},
		handleSubmit() {
			updateMyProfile(this.form.username, this.form.password)
				.then(() => {
					this.$notification['success']({
						message: 'Success',
					})
					this.$router.push('/my-profile')
				})
				.catch((err) =>
					this.$notification['error']({
						message: err,
					})
				)
		},
	},
	mounted: async function() {
		this.$emit('update:selectedKeys', [this.$router.currentRoute.path])
		await getMyUserDetails()
			.then((res) => {
				this.$emit('update:user', res.data)
				this.form.username = res.data.username
			})
			.catch((err) => {
				console.error(err)
				this.$emit('update:user', {})
				this.$router.push('/')
			})
	},
}
</script>
