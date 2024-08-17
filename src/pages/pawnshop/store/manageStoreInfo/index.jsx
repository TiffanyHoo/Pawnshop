import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Tag, Form, Drawer, Select, Space, Modal, notification, Badge, Image } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
import '../../../../style/manageStoreInfo.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, MinusOutlined, SmileOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Search,TextArea } = Input;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};


export default class ManageStoreInfo extends Component {
  constructor(props) {
    super(props);
    //SDID,SHID,PIID,title,state,PSstaffIDin,inDate,PSstaffIDout,outDate,Notes

    this.columns = [
      {
        title: '存储编号',
        dataIndex: 'SDID',
        key: 'SDID',
        editable: false,
        width: '100px',
        sorter: (a, b) => a.SDID - b.SDID,
        ...this.getColumnSearchProps('SDID','存储编号')
      },
      {
        title: '仓库编号',
        dataIndex: 'SHID',
        key: 'SHID',
        width: '90px',
        filters: [
          {text: '一号仓库',value: 'SH1001'},
          {text: '二号仓库',value: 'SH1002'}
        ],
      onFilter: (value, record) => record.SHID === value,
      },
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '120px',
        sorter: (a, b) => {
          var stringA = a.PTID.toUpperCase(); // ignore upper and lowercase
          var stringB = b.PTID.toUpperCase(); // ignore upper and lowercase
          if (stringA < stringB) 
            return -1;
          if (stringA > stringB) 
            return 1;
          return 0;
        },
        ...this.getColumnSearchProps('PTID','当票编号')
      },
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        width: '130px',
        ...this.getColumnSearchProps('PIID','当物编号')
      },
      {
        title: '当品名称',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '130px',
        ...this.getColumnSearchProps('itemName','当品名称')
      },
      {
        title: '当品类目',
        dataIndex: 'title',
        key: 'title',
        width: '100px',
        ...this.getColumnSearchProps('title','当品类目')
      },
      {
        title: '入库时间',
        dataIndex: 'inDate',
        key: 'inDate',
        width: '100px',
        sorter: (a, b) => a.inDate - b.inDate
      },
      // {
      //   title: '入库人员',
      //   dataIndex: 'PSstaffIDin',
      //   key: 'PSstaffIDin',
      //   width: '100px'
      // },
      {
        title: '出库时间',
        dataIndex: 'outDate',
        key: 'outDate',
        width: '100px',
        sorter: (a, b) => a.outDate - b.outDate
      },
      // {
      //   title: '出库人员',
      //   dataIndex: 'PSstaffIDout',
      //   key: 'PSstaffIDout',
      //   width: '100px'
      // }
    ];

    this.columns_item = [
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '163px',
        ...this.getColumnSearchProps('PTID','当票编号')
      },
      {
        title: '当物编号',
        dataIndex: 'PIID',
        key: 'PIID',
        ...this.getColumnSearchProps('PIID','当物编号')
      },
      {
        title: '当物名称',
        dataIndex: 'title',
        key: 'title',
        width: '100px'
      },
      {
        title: '典当日期',
        dataIndex: 'StartDate',
        key: 'StartDate',
        width: '100px'
      },
      {
        title: '当物状态',
        dataIndex: 'state',
        key: 'state',
        width: '80px',
        render: (_, record) =>
          record.state === "1" ? (
              <Badge color="green" text="在当" />
          ) : record.state === "2" ? (
              <Badge color="volcano" text="绝当" />
          ) : record.state === "3" ? (
              <Badge color="orange" text="在售" />
          ) : <Badge color="green" text="在当" />
        }         
    ]

    this.columns_sh = [
      {
        title: '仓库编号',
        dataIndex: 'SHID',
        key: 'SHID',
        width: '100px'
      },
      {
        title: '面积',
        dataIndex: 'Area',
        key: 'Area',
        width: '100px'
      },
      {
        title: '大宗物件',
        dataIndex: 'CanBulkObj',
        key: 'CanBulkObj',
        width: '100px',
        render: (_, record) =>
          record.CanBulkObj === "0" ? (
            <Tag color="error">不支持</Tag>
          ) : record.CanBulkObj === "1" ? (
            <Tag color="success">支持</Tag>
          ) : ''
      },
      {
        title: '车辆',
        dataIndex: 'CanVehicle',
        key: 'CanVehicle',
        width: '100px',
        render: (_, record) =>
          record.CanVehicle === "0" ? (
            <Tag color="error">不支持</Tag>
          ) : record.CanVehicle === "1" ? (
            <Tag color="success">支持</Tag>
          ) : ''
      },
      {
        title: '满仓',
        dataIndex: 'IsFull',
        key: 'IsFull',
        width: '100px',
        render: (_, record) =>
          record.IsFull === "0" ? (
            <Tag color="#87d068">否</Tag>
          ) : record.IsFull === "1" ? (
            <Tag color="#f50">是</Tag>
          ) : ''
      }
    ]

    this.columns_store = [
      {
        title: '存储编号',
        dataIndex: 'SDID',
        key: 'SDID',
        width: '95px',
        ...this.getColumnSearchProps('SDID','存储编号')
      },
      {
        title: '仓库编号',
        dataIndex: 'SHID',
        key: 'SHID',
        width: '80px'
      },
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '95px',
        ...this.getColumnSearchProps('PTID','当票编号')
      },
      {
        title: '当物编号',
        dataIndex: 'PIID',
        key: 'PIID',
        width: '150px',
        ...this.getColumnSearchProps('PIID','当物编号')
      },
      {
        title: '当物名称',
        dataIndex: 'title',
        key: 'title',
        width: '95px',
        ...this.getColumnSearchProps('title','当物名称')
      },
      {
        title: '备注',
        dataIndex: 'Notes',
        key: 'Notes'
      }
    ]

    this.state = {
      isIn: false,
      isOut: false,
      visible: false ,
      ImageVisible: false,
      dataSource: [],
      StoreHouse: [],
      itemData: [],
      selectedRows: [],
      storeData: [],
      selectedRowKeys1: [],
      selectedRowKeys2: [],
      count: 0,
      SDID: '',
      SHID: '',
      PTID: '',
      PIID: '',
      state: '',
      PSstaffIDin: '',
      inDate: '',
      PSstaffIDout: '',
      outDate: '',
      Notes: '',
      selectedOBJ:{}
    };
  }

  //搜索
  getColumnSearchProps = (dataIndex,name) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8 }}>
        <Search
        ref={node => {
            this.searchInput = node;
        }}
        placeholder={`搜索 ${name}`}
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
        style={{ marginBottom: 8, display: 'block' , width: 180 }}
        enterButton
        onSearch={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
        />
    </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? 'orange' : undefined }} />,
    onFilter: (value, record) =>
    record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
        if (visible) {
            setTimeout(() => this.searchInput.select(), 100);
        }
    }
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      this.setState({
        searchText: selectedKeys[0],
        searchedColumn: dataIndex,
      });
  };

  componentDidMount(){
    this.getData()
  }

  //初始化数据
  getData = async () => {
    let dataSource = []    
    let StoreHouse = []

    await axios.get('/getStoreDetail',{
      params:{
        type: 'StoreDetail',
        id: store.getState().PSID,
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource = response.data
        }
    }).catch(error=>{
        console.log(error);
    });

    dataSource = dataSource.map((obj,index) => {
      return {
        ...obj,
        key: index
      };
    });

    await axios.get('/getStorehouse',{
      params:{
        id: store.getState().PSID,
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          StoreHouse = response.data
        }
    }).catch(error=>{
        console.log(error);
    });

    StoreHouse = StoreHouse.map((obj,index) => {
      return {
        ...obj,
        key: obj.SHID
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
      StoreHouse
    })
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };

  //关闭窗口
  handleCancel = () => {
    this.setState({isIn:false,isOut:false,selectedRowKeys1:[],selectedRowKeys2:[]})
  };

  //入库
  handleIn = async () => {
    var that = this
    let itemData = []

    await axios.get('/getStoreDetail',{
      params:{
        type: 'putin',
        id: store.getState().PSID,
      }
    }).then(response=>{
        itemData = response.data
        itemData = itemData.map((obj,index) => {
          return {
            ...obj,
            key: index
          };
        });
    
        that.setState({
          itemData,isIn:true,SHID:'',selectedRows:[]
        })
    });

  }

  putinOk = async () => {
    var that = this
    const {selectedRows,SHID,Notes} = this.state
    const inDate = moment(new Date()).format('YYYY-MM-DD')
    for (const item of selectedRows) {
      const {PTID,PIID} = item;
      let data = {
        type: 'putin',
        SDID: 'SD'+store.getState().PSID.substring(2),
        PTID,PIID,SHID,inDate,Notes,
        PSstaffIDin: store.getState().PSstaffID
      }
      await axios({
        method: 'post',
        url: 'http://localhost:3000/modStore',
        data: Qs.stringify(data)
      }).then(response=>{
        const {newSDID} = response.data[0]
        notification.open({
          message: 'Notification',
          description:
            <div style={{whiteSpace: 'pre-wrap'}}>已成功入库，存储单号为{newSDID}</div>,
          icon: <SmileOutlined style={{color:'orange'}}/>,
          duration: 2
        });
        that.getData();
      })
    }
    this.handleCancel()
  };

  //出库
  handleOut = async () => {
    var that = this
    let storeData = []
    await axios.get('/getStoreDetail',{
      params:{
        type: 'takeout',
        id: store.getState().PSID,
      }
    }).then(response=>{
        storeData = response.data
        storeData = storeData.map((obj,index) => {
          return {
            ...obj,
            key: obj.SDID
          };
        });
    
        that.setState({
          storeData,isOut:true,selectedRows:[]
        })
    });
  }

  takeoutOk = async () => {
    var that = this
    const {selectedRows} = this.state
    const outDate = moment(new Date()).format('YYYY-MM-DD')
    for (const item of selectedRows) {
      const {SDID} = item;
      let data = {
        type: 'takeout',
        SDID,outDate,
        PSstaffIDout: store.getState().PSstaffID
      }
      await axios({
        method: 'post',
        url: 'http://localhost:3000/modStore',
        data: Qs.stringify(data)
      }).then(response=>{
        notification.open({
          message: 'Notification',
          description:
            <div style={{whiteSpace: 'pre-wrap'}}>存储单号为{SDID}的物品已成功出库</div>,
          icon: <SmileOutlined style={{color:'orange'}}/>,
          duration: 2
        });
        that.getData();
      })
    }
    this.setState({isOut:false})
  }

  render() {
    const { ImageVisible,selectedOBJ,selectedRowKeys1,selectedRowKeys2,isIn,isOut,itemData,StoreHouse,storeData,dataSource,DrawerTitle,SHID,Address,Area,CanBulkObj,CanVehicle,Sedan,Motorbike,IsFull,PSstaffID,Notes } = this.state;
    const { images,title,Specification,Documents,Discript } = selectedOBJ
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title
        }),
      };
    });

    return (
      <div>
        <Breadcrumb style={{ margin: '10px' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>仓库存放管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button type="primary" onClick={this.handleIn} icon={<PlusOutlined />} style={{marginBottom: 10}}>
            入库
          </Button>
          <Button type="primary" onClick={this.handleOut} icon={<MinusOutlined />} style={{marginBottom: 10, marginLeft:10}}>
            出库
          </Button>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10}}
            size="small"
            expandable={{
              expandedRowRender: record => <p style={{ margin: 0 }}>规格: {record.Specification}&nbsp;&nbsp;&nbsp;&nbsp;附件: {record.Documents}<br/>备注：{record.Notes}</p>,
              rowExpandable: record => record.title !== '' || record.Specification !== '' || record.Documents !== '',
            }}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  const selectedOBJ = {...record,images:record.photopath.split(";")}
                  this.setState({selectedOBJ,visible:true})
                },
              };
            }}
          />
        </div>
        <Drawer
          title="物品详情"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Space size={20} align='start' style={{display:'flex',marginRight:'50px'}}>
              <Image
              preview={{visible:false}}
              width={200}
              src={images?images[0]:''}
              onClick={() => this.setState({ImageVisible:true})}
              />
              <div style={{ display: 'none' }}>
              <Image.PreviewGroup preview={{ visible:ImageVisible, onVisibleChange: vis => this.setState({ImageVisible:vis}) }}>
                {images?images.map((item,i)=>
                    (
                        <Image key={i} src={item} />
                    ) 
                ):''}
              </Image.PreviewGroup>
              </div>
              <Space size={5} direction="vertical" style={{marginTop:'-100px'}}>
                  <p>物品名称 : {title}</p>
                  <p>物品详情 : {Specification}</p>
                  <p>可提供附件 : {Documents}</p>
                  <p>物品描述 : {Discript}</p>
              </Space>
          </Space>
        </Drawer>
        <Modal 
        title="入库" 
        width={700} 
        visible={isIn} 
        onOk={this.putinOk} 
        onCancel={this.handleCancel}>
          <Table
            size='small'
            scroll={{y : 270}}
            pagination={false}
            rowSelection={{
              type: "check",
              selectedRowKeys:selectedRowKeys1,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys1:selectedRowKeys,selectedRows})
              }
            }}
            columns={this.columns_item}
            dataSource={itemData}
            style={{height:300,marginBottom:16}}
          />
          <Table
            size='small'
            scroll={{y : 150}}
            pagination={false}
            rowSelection={{
              type: "radio",
              selectedRowKeys:selectedRowKeys2,
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys2:selectedRowKeys,SHID:selectedRowKeys[0]})
              }
            }}
            columns={this.columns_sh}
            dataSource={StoreHouse}
          />
          <TextArea rows={2} placeholder="请输入备注" maxLength={3} onChange={(e)=>this.setState({Notes:e.target.value})}/>
        </Modal>
        <Modal 
        title="出库" 
        width={700} 
        visible={isOut} 
        onOk={this.takeoutOk} 
        onCancel={this.handleCancel}>
          <Table
            size='small'
            scroll={{y : 300}}
            pagination={false}
            rowSelection={{
              type: "check",
              onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRows})
              }
            }}
            columns={this.columns_store}
            dataSource={storeData}
            style={{height:300,marginBottom:16}}
          />
        </Modal>
      </div>
    )
  }
}
