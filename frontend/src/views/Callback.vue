<template>
	<div>
		<h1>Callback</h1>
		<h2>{{ code }}</h2>
	</div>
</template>

<script>
export default {
	data() {
		return {
			code: null,
		}
	},
	mounted: function() {
		console.log(this.$route.query.code)
		this.code = this.$route.query.code
	},
}
</script>

<style></style>
