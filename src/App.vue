<script setup>
import {reactive, ref} from "vue";
  import * as XLSX from 'xlsx'
  // input 元素
  const fileInput = ref(null)
  // 存储文件信息
  const selectedFile = ref(null)
  // 工作表数量
  const sheetCount = ref(null)
  // 格式化结果
  const jsonResult = ref(null)
  // 输入的款号
  const intValue = ref(null)
  // 显示开始查找
  const hasStartFind = ref(false)


  // 本地数据
  //文件名称
  const tableName = ref(null)
  // 文件数据
  const tableData = ref(null)

  // 查询过的数据
  const allFind = reactive([])

  // 提取渲染数据
  const getAnimateData = ref({
    from:'',
    id:'',
    rediscount:'',
    standard_price:'',
    series:''
  })

  init()

  function init(){

    if (getData()){
      // 保存数据
      jsonResult.value = tableData.value
      // 可以进行查找
      hasStartFind.value = true
    }else{
      console.log("没有数据")
      console.log(tableName.value,tableData.value)
    }
  }



  // 处理文件的选择
  function handleFileChange(){
    const file = fileInput.value.files[0]
    if (file){
      selectedFile.value = file
    }

    hasStartFind.value = false
    // console.log(selectedFile.value)

  }

  // 提交
  function handleSubmit(){
    // 判断有没有这个文件
    if (!selectedFile.value){
      alert("请先选择文件")
      return
    }

    // 获取文件后缀名
    const fileExtSplit = selectedFile.value.name.split(".")
    const fileExt = fileExtSplit[fileExtSplit.length - 1]

    // 文件格式筛选
    if (!['xlsx', 'xls'].includes(fileExt)){
      alert("文件格式出错，请查看是否是 xlsx 或 xls 格式文件")
      return;
    }

    console.log("符合条件")
    convertToJson()



    // 可以进行查找
    hasStartFind.value = true

  }

  // 转换 Excel 为 json
  function convertToJson (){
    if (!selectedFile.value) return

    const reader = new FileReader()

    reader.onload = (e)=> {
      try{
        // 解析 Excel 内容
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data,{type:'array'})

        // 存储所有的工作表的对象
        const allSheetsData = {}

        // 遍历所有工作表
        workbook.SheetNames.forEach(sheetName=>{
          // 将当前工作表转换为 JSON
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

          // 以工作表名称为键存储数据
          allSheetsData[sheetName] = sheetData
          // console.log(allSheetsData)

          // 记录工作表数量
          sheetCount.value = workbook.SheetNames.length

          // 格式化 JSON结果
          jsonResult.value = JSON.stringify(allSheetsData,null,2)
          jsonResult.value = JSON.parse(jsonResult.value)


          // 保存到本地 数据格式 , 文件名
          saveData(jsonResult.value,selectedFile.value.name)
          // 获取刷新页面数据
          getData()
          console.log(jsonResult.value,selectedFile.value.name)
        })
      } catch (e){
        alert("解析失败"+e.message)
        jsonResult.value = ''
      }
    }


    // 读取文件为 二进制数据 - 不写这段上面的 try 就不会执行或打印
    reader.readAsArrayBuffer(selectedFile.value)
  }


  // 查找
  function findData(jsonResult,id){
    // 将字符串格式 转换为 JSON 对象
    for (const items in jsonResult){
      // console.log(items)
      const foundItem = jsonResult[items].find((item)=>{
        // console.log(item.款号 , id)
        console.log(items)
        return item.款号 === id
      })

      if (foundItem){
        const index = jsonResult[items].indexOf(foundItem)
        console.log(`在工作表【${items}】中找到，索引：${index}`);
        return {
          sheetname: items,
          index: index,
          data:foundItem
        }
      }
    }
  }

  // 修改
  function updataData(jsonResult){

    // 强制大写
    const id = intValue.value.value.toString().toUpperCase()

    if (!id) {
      alert("款号不能为空！ 请输入")
      return
    }


    // 判断是否重复
    if (!allFind.includes(id)){
      allFind.push(id)
    }
    console.log(allFind)




    // console.log(allFind)
    // console.log(jsonResult)
    const itemData =  findData(jsonResult,id)
    // console.log(itemData)
    getAnimateData.value = {
      from:itemData.sheetname,
      id:itemData.data.款号,
      rediscount:itemData.data.现折扣,
      standard_price:itemData.data.标准价,
      series:itemData.data.系列
    }
  }

  // 保存到本地存储
  function saveData(objData,name){
    localStorage.setItem('tableData',JSON.stringify(objData))
    localStorage.setItem('tableName',name)
  }

  function getData(){
    tableData.value = JSON.parse(localStorage.getItem('tableData'))
    tableName.value = localStorage.getItem('tableName')
    if (tableData.value === null || tableName.value === null){
      return false
    }
    return true
  }


</script>

<template>
  <div class="container">
    <div class="local_data">
      <p>缓存文件数据：{{ tableName ? tableName : '暂时没有缓存' }}</p>
    </div>
    <div class="submit_file">
      <input type="file" ref="fileInput" @change="handleFileChange">
      <button @click="handleSubmit">提交</button>
    </div>

    <div class="int_content">
      <label for="int_id">输入款号：</label>
      <input id="int_id" type="text" placeholder="请输入款号" ref="intValue">
      <button v-if="hasStartFind" @click="updataData(jsonResult)">开始查找</button>
    </div>

    <div class="animate_data">
      <p>来源：{{ getAnimateData.from }}</p>
      <p>款号：{{ getAnimateData.id }}</p>
      <p>现折扣：{{ getAnimateData.rediscount }}</p>
      <p>标准价：{{ getAnimateData.standard_price }}</p>
      <p>系列：{{ getAnimateData.series }}</p>
    </div>

    <div class="table_list">
      <p class="find">历史查询记录：</p>
      <ol>
        <li v-for="item in allFind">{{ item }}</li>
      </ol>
    </div>
  </div>

</template>

<style>
  *{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container{
    padding: 20px 15px;
  }

  .submit_file{
    width: 100%;
    height: 85px;
    display: flex;
    align-items: center;
  }

  button{
    width: 80px;
    height: 35px;
  }

  #int_id{
    height: 30px;
  }

  .animate_data{
    border-bottom: 2px dashed #000;
    margin-top: 20px;
  }

  .animate_data p{
    height: 40px;
  }

  .table_list .find{
    font-size: 18px;
    margin: 20px 0px 5px;
  }

  li{
    height: 30px;
    margin: 5px 20px 0px 30px;
  }

</style>