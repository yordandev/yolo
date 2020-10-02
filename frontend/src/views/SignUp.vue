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
					<a-form-model
						:model="form"
						:label-col="labelCol"
						:wrapper-col="wrapperCol"
						:rules="rules"
					>
						<a-form-model-item label="Username" required prop="username" hasFeedback
							><a-input v-model="form.username" placeholder="Username"
						/></a-form-model-item>
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
		let validatePass = (rule, value, callback) => {
			if (this.form.confirmPassword !== '') {
				this.$refs.ruleForm.validateField('checkPass')
			} else {
				callback()
			}
		}
		let validatePass2 = (rule, value, callback) => {
			if (value !== this.form.password) {
				callback(new Error("Two inputs don't match!"))
			} else {
				callback()
			}
		}
		return {
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
					{ min: 7, max: 14, message: 'Length should be 7 to 14' },
					{ validator: validatePass, trigger: 'change' },
				],
				confirmPassword: [
					{ required: true, message: 'Please confirm Password' },
					{ min: 7, max: 14, message: 'Length should be 7 to 14' },
					{ validator: validatePass2, trigger: 'change' },
				],
			},
		}
	},
	methods: {
		handleSubmit(e) {
			e.preventDefault()
			console.log(this.form)
		},
	},
}
</script>
<style scoped></style>
