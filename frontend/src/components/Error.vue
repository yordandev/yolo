<template>
	<a-row type="flex" justify="center" class="error"
		><a-col span="14" class="error2">
			<a-col span="2"><a-icon type="close-circle" style="font-size: 24px;" /> </a-col
			><a-col span="20"> <p>Error message asdasdasdsadasdasdasdsa</p></a-col></a-col
		></a-row
	>
</template>

<script>
export default {}
</script>

<style scoped>
.error {
	color: white;
	display: flex;
	align-items: center;
	margin: 0 auto 20px auto;
}
.error2 {
	background-color: #ff5252;
	padding: 10px;
}
p {
	margin: 0;
	font-size: 14px;
}
</style>
