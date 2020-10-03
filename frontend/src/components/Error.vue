<template>
	<a-row type="flex" justify="center" class="error">
		<a-col span="2"><a-icon type="close-circle" style="font-size: 30px; margin: 0 auto;" /> </a-col
		><a-col span="21"> <p>Error message asdasdasdsadasdasdasdsa</p></a-col></a-row
	>
</template>

<script>
export default {}
</script>

<style scoped>
.error {
	color: white;
	width: 40vw;
	display: flex;
	background-color: #ff5252;
	align-items: center;
	margin: 0 auto;
	padding: 10px 0;
}
p {
	margin: 0;
	font-size: 18px;
}
</style>
