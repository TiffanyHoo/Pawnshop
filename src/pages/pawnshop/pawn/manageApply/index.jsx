import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Modal, Tag, Cascader, Upload, message, Badge, Image } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { SearchOutlined, WarningOutlined, SmileOutlined, DownOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import moment from 'moment';

const { Option } = Select;
const { CheckableTag } = Tag;
const { RangePicker } = DatePicker;

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
        <Input ref={inputRef} />
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

const getRandomuserParams = (params) => ({
    PSID: store.getState().PSID,
    pagesize: params.pagination.pageSize,
    pageno: params.pagination.current,
    ApplyType: params.ApplyType==undefined||params.ApplyType==null?'1,2,3,4':params.ApplyType.join(','),
    state: params.state==undefined||params.state==null?'0,1,2,3':params.state.join(','),
    UserName: params.UserName?params.UserName[0]:'',
    UserID: params.UserID?params.UserID[0]:'',
    ordercolumn: params.sortField?params.sortField:'',
    orderdir: params.sortOrder==='ascend'?1:0,
    type: 'PSgetApplyPage',
    //...params,
});

export default class ManageApply extends Component {
    constructor(props) {
        super(props);
//ApplyID,ApplyType,UserID,PSID,TID,PTID,Amount,Fare,Plandate,ApplyDate,state,ShowInUser,ShowInPS,ANotes)values
        this.columns = [
            {
                title: '操作',
                dataIndex: 'operation',
                fixed: 'left',
                width: '100px',
                render: (_, record) =>
                this.state.dataSource.length >= 1 ? (
                    <div>
                    <Popconfirm title="确认报价吗？" onConfirm={() => this.showModal(record)}>
                        <a>报价</a>
                    </Popconfirm>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Popconfirm title="确认删除吗？" onConfirm={() => this.handleDelete(record.ApplyID)}>
                        <a>删除</a>
                    </Popconfirm>
                    </div>
                ) : null
            },
            {
                title: '申请单编号',
                dataIndex: 'ApplyID',
                key: 'ApplyID',
                fixed: 'left',
                width: '90px'
            },         
            {
                title: '申请类型',
                dataIndex: 'ApplyType',
                key: 'ApplyType',
                fixed: 'left',
                width: '105px',
                filters: [
                    {text: '建当',value: '1'},
                    {text: '续当',value: '2'},
                    {text: '赎当',value: '3'},
                    {text: '绝当',value: '4'}
                ],
                onFilter: (value, record) => record.ApplyType === value,
                sorter: (a, b) => a.ApplyType*1 - b.ApplyType*1,
                render: (_, record) =>
                    record.ApplyType === "1" ? (
                        <span>建当</span>
                    ) : record.ApplyType === "2" ? (
                        <span>续当</span>
                    ) : record.ApplyType === "3" ? (
                        <span>赎当</span>
                    ) : record.ApplyType === "4" ? (
                        <span>绝当</span>
                    ) : ''
            }, 
            {
                title: '物品',
                dataIndex: 'things',
                key: 'things',
                width: '200px',
                ellipsis: {
                    showTitle: false,
                },
                render: e => (
                <Tooltip placement="topLeft" title={e}>
                    {e}
                </Tooltip>
                ),
            },
            {  
                title: '物品数量',
                dataIndex: 'Quantity',
                key: 'Quantity',
                width: '90px',
                sorter: (a, b) => a.TID.split(";").length - b.TID.split(";").length,
                render: (_, record) =>
                {
                    //console.log(record)
                    return <span>{record.TID.split(";").length}</span>
                }
                    
            },
            {
                title: '期望到手价',
                dataIndex: 'ExpectAmount',
                key: 'ExpectAmount',
                width: '90px'
            },  
            {
                title: '预估价',
                dataIndex: 'Amount',
                key: 'Amount',
                width: '110px'
            }, 
            {
                title: '用户姓名',
                dataIndex: 'UserName',
                key: 'UserName',
                width: '100px',
                ...this.getColumnSearchProps('UserName','用户姓名'),
                render: (_, record) => (
                <Tooltip placement="topLeft" title={record.Gender==='1'?'女':'男'}>
                    {record.UserName}
                </Tooltip>
                ),
            },
            {
                title: '用户证件号',
                dataIndex: 'UserID',
                key: 'UserID',
                width: '140px',
                ...this.getColumnSearchProps('UserID','用户证件号'),
                render: (UserID) => (
                    <span>{UserID.substring(0,UserID.length-4)+"****"}</span>
                )
            },
            {
                title: '联系电话',
                dataIndex: 'Phone',
                key: 'Phone',
                width: '100px'
            }, 
            {
                title: '联系邮箱',
                dataIndex: 'Email',
                key: 'Email',
                width: '100px',
                ellipsis: {
                    showTitle: false,
                },
                render: Email => (
                <Tooltip placement="topLeft" title={Email}>
                    {Email}
                </Tooltip>
                )
            },     
            {
                title: '微信号',
                dataIndex: 'Wechat',
                key: 'Wechat',
                width: '100px',
                ellipsis: {
                    showTitle: false,
                },
                render: e => (
                <Tooltip placement="topLeft" title={e}>
                    {e}
                </Tooltip>
                ),
            },   
            {
                title: '计划到行时间',
                dataIndex: 'Plandate',
                key: 'Plandate',
                width: '100px'
            },
            {
                title: '申请时间',
                dataIndex: 'ApplyDate',
                key: 'ApplyDate',
                width: '100px'
            }, 
            {
                title: '处理状态',
                dataIndex: 'state',
                key: 'state',
                fixed: 'right',
                width: '105px',
                filters: [
                    {text: '未报价',value: '1'},
                    {text: '已报价',value: '2'},
                    {text: '已转换',value: '3'},
                    {text: '已取消',value: '0'},
                ],
                onFilter: (value, record) => record.state === value,
                sorter: (a, b) => a.state*1 - b.state*1,
                render: (_, record) =>
                    record.state === "1" ? (
                        <Badge color="volcano" text="未报价" />
                    ) : record.state === "2" ? (
                        <Badge color="green" text="已报价" />
                    ) : record.state === "0" ? (
                        <Badge color="orange" text="已取消" />
                    ) : <Badge color="blue" text="已转换" />
            }  
        ];

        this.state = {
            ImageVisible: false,
            previewVisible: false,
            isModalVisible: false,
            visible1: false ,
            visible2: false ,
            visible_modal: false,
            dataSource: [],
            dataSource1: [],
            count: 0,
            TotalPrice: 0,
            UserID: '',
            Notes: '',
            StartDate:'',
            EndDate:'',
            ENotes:'',
            Total: '',
            totalAmount:'',
            ApplyID:'',
            ApplyType:'',

            PTID: '',
            PIID: '',
            CID: '',
            AssessPrice:'',
            Rate:'',
            Amount:'',
            photopath: '',
            state: '',
            title: '',
            category:'',
            day:30,
            date:'',
            ExpectAmount:'',
            Amount:'',
            ANotes: '',

            searchText: '',
            searchedColumn: '',

            //分页
            pagination: {
                current: 1,
                pageSize: 10,
            },
            loading: false

        };
    }

    //搜索
    getColumnSearchProps = (dataIndex,name) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
            <Input
            ref={node => {
                this.searchInput = node;
            }}
            placeholder={`搜索 ${name}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
            <Button
                type="primary"
                onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
            >
                搜索
            </Button>
            <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                重置
            </Button>
            <Button
                type="link"
                size="small"
                onClick={() => {
                confirm({ closeDropdown: false });
                this.setState({
                    searchText: selectedKeys[0],
                    searchedColumn: dataIndex,
                });
                }}
            >
                过滤
            </Button>
            </Space>
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
        },
        // render: text =>
        //      this.state.searchedColumn == dataIndex ? (
        //         <Highlighter
        //         highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        //         searchWords={[this.state.searchText]}
        //         autoEscape
        //         textToHighlight={text ? text.toString() : ''}
        //         />
        //     ) : (
        //         text
        //     ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
          searchText: selectedKeys[0],
          searchedColumn: dataIndex,
        });
    };
    
    handleReset = clearFilters => {
      clearFilters();
      this.setState({ searchText: '' });
    };

    componentDidMount(){
        const date = moment(new Date()).add(30,'days').format('YYYY-MM-DD')
        this.setState({
            date,PSID:store.getState().PSID
        })

        const { pagination } = this.state;
        this.getData({ pagination });
    }

    formRef = React.createRef();
    formRef2 = React.createRef();
    formRef3 = React.createRef();

    handleTableChange = (pagination, filters, sorter) => {
        console.log(pagination, filters, sorter)

        this.getData({
          sortField: sorter.field,
          sortOrder: sorter.order,
          pagination,
          ...filters,
        });
    }

    //列表数据
    getData = async (params = {}) => {
        console.log(params)
        let { sortField,sortOrder,ApplyType,UserName,state } = params
        ApplyType = ApplyType==undefined||ApplyType==null?'1,2,3,4':ApplyType.join(',')
        state = state==undefined||state==null?'0,1,2,3':state.join(',')
        //state = state?state:'0,1,2,3'
        console.log(ApplyType==undefined)
        console.log(ApplyType==null)
        console.log(typeof ApplyType)
        console.log(ApplyType)

        this.setState({ loading: true });
        fetch(`http://localhost:3000/getApply?${Qs.stringify(getRandomuserParams(params,ApplyType,state))}`)
            .then(res => res.json())
            .then(data => {
            console.log(data);
            const dataSource = data.map((obj,index) => {
                return {
                    ...obj,
                    key: index
                };
            });
            this.setState({
              loading: false,
              dataSource,
              count: dataSource.length,
              pagination: {
                ...params.pagination,
                total: dataSource[0]?dataSource[0].total:0,
              },
            });

        });

        // const {PSID} = store.getState()
        // let dataSource = []
        // await axios.get('/getApply',{
        // params:{
        //     PSID,
        //     type: 'PSgetAllApply'
        // }
        // }).then(response=>{
        //     if(response.data.length === 0){
        //     console.log('无数据')
        //     }else{
        //     dataSource = response.data
        //     }
        // }).catch(error=>{
        //     console.log(error);
        // });

        // dataSource = dataSource.map((obj,index) => {
        //     return {
        //         ...obj,
        //         key: index
        //     };
        // });

        // this.setState({
        // dataSource,
        // count: dataSource.length
        // })
    }

    //获取物品信息
    getThings1 = async (TID) => {
        var that = this
        const things = TID.split(";")
        let dataSource1 = []
        things.forEach(async (UIID,index)=>{
            let obj ={}
            await axios.get('/getUserItems',{
                params:{
                    UIID,
                    type:'PSgetItem'
                }
            }).then(response=>{
                if(response.data.length === 0){
                    console.log('无数据')
                }else{
                    obj = response.data[0]
                    obj.key = index
                    obj.images=obj.photopath.split(";")
                    dataSource1.push(obj)
                    if(index===things.length-1){
                        //console.log(dataSource1)
                        that.setState({
                            dataSource1
                        })
                    }
                }
            }).catch(error=>{
                console.log(error);
            })

        })
 
    }
    //获取物品信息&当单信息
    getThings2 = async (PTID) => {
        let dataSource1 = []
            await axios.get('/getPawnItems',{
                params:{
                    PTID, usertype:'PS'
                }
            }).then(response=>{
                if(response.data.length === 0){
                    console.log('无数据')
                }else{
                    dataSource1 = response.data
                }
            }).catch(error=>{
                console.log(error);
            })

            const {StartDate,EndDate,Total,Notes,ENotes} = dataSource1[0]
            console.log(StartDate,EndDate,Total,Notes,ENotes)

            const totalAmount = dataSource1.reduce(function(total,obj) {
                return total + obj.Amount*1;
            }, 0);

            dataSource1 = dataSource1.map((obj,index) => {
                return {
                    ...obj,
                    key: index,
                    images: obj.photopath.split(";")
                };
            });
            console.log(totalAmount)
            console.log(dataSource1)
    
            this.setState({
                dataSource1,StartDate,EndDate,Total,Notes,ENotes,totalAmount,
                count: dataSource1.length
            })

 
    }

    //当户端删除申请单
    handleDelete = async (ApplyID) => {
        let data = {
            ApplyID, type: 'PS_del'
        }
        await axios({
            method: 'post',
            url: 'http://localhost:3000/modApplication',
            data: Qs.stringify(data)
        })
        this.getData()
    };

    //申请单
    showDrawer = () => {
        this.setState({
        visible1: true,
        TotalPrice: 0,
        Quantity: '',
        dataSource1:[],
        fileList: [],
        Interest: 0,
        StoreFare: 0,
        OverdueFare: 0,
        FreightFare: 0,
        AuthenticateFare: 0,
        AssessFare: 0,
        NotaryFare: 0,
        InsuranceFare: 0,
        OtherFare: 0
        });
        setTimeout(() => {
        this.formRef.current.resetFields();
        }, 200);
    };

    onClose = () => {
        this.setState({
        visible1: false,
        visible2: false,
        UIID: '',
        CID: '',
        UserID: '',
        UserName: '',
        Address: '',
        Phone: '',
        Email: '',
        Wechat: '',
        photopath: '',
        state: '',
        title: '',
        dataSource1:[]
        });
    };

    //报价单
    showModal = (record) => {
        const { ApplyID,ApplyType,Amount,ANotes,state } = record.ApplyID!==undefined?record:this.state
        if(state==0){
            notification.open({
                message: '消息',
                description:
                    <div style={{whiteSpace: 'pre-wrap'}}>用户已取消申请，无法报价！</div>,
                icon: <WarningOutlined style={{color:'orange'}}/>,
                duration: 2
            });
            return;
        }
        this.setState({
            visible_modal: true,
            ApplyID,ApplyType,Amount,ANotes
        });
        setTimeout(() => {
            this.formRef3.current.resetFields();
            this.formRef3.current.setFieldsValue({
                ApplyID,Amount,ANotes 
            });
        }, 200); 
    };

    //保存报价
    handleSave= async () => {
        const { ApplyID,Amount,ANotes,pagination,visible1,visible2 } = this.state
        let data = {
            ApplyID,Amount,ANotes,
            type: 'PS_mod'
        }
        await axios({
            method: 'post',
            url: 'http://localhost:3000/modApplication',
            data: Qs.stringify(data)
        })
        this.getData({ pagination });
        setTimeout(() => {
            if(visible1){
                this.formRef.current.setFieldsValue({
                    ANotes 
                });
            }
            if(visible2){
                this.formRef2.current.setFieldsValue({
                    ANotes 
                });
            }
        }, 200); 
        notification.open({
            message: '消息',
            description:
                <div style={{whiteSpace: 'pre-wrap'}}>已成功报价</div>,
            icon: <SmileOutlined style={{color:'orange'}}/>,
            duration: 2
        });
    };
    
    render() {
        const { data2, pagination2 } = this.state;
        const { data, pagination, loading } = this.state;
        const { PTID,Total,totalAmount,StartDate,EndDate,ENotes,Notes,ImageVisible,ApplyID,ApplyType,dataSource,dataSource1,PIID,CID,UserID,UserName,Gender,Address,Phone,Email,Wechat,ANotes,photopath,state,title} = this.state;    
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
                title: col.title,
                }),
            };
        });

        return (
        <div>
            <Breadcrumb style={{ margin: '10px' }}>
                <Breadcrumb.Item>典当管理</Breadcrumb.Item>
                <Breadcrumb.Item>申请单管理</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-background" style={{ padding: 10 }}>
            <Table
                className='ant-table'
                components={components}
                rowKey={record => record.ApplyID}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={pagination}
                loading={loading}
                onChange={this.handleTableChange}
                size="small"
                scroll={{ x: 1800 }}
                minHeight="600"
                onRow={record => {
                return {
                    onDoubleClick: event => {
                        const { PTID,ApplyID,ApplyType,UserID,UserName,Gender,Address,Phone,Email,Wechat,TID,ExpectAmount,Amount,Fare,Plandate,ApplyDate,state,ShowInUser,ShowInPS,ANotes,Total,ENotes } = record
                        console.log(record)
                        this.setState({
                            PTID,ApplyID,ApplyType,UserID,ExpectAmount,Amount,ANotes,state,Notes,Total,ENotes,
                            visible1: ApplyType=='1'?true:false,visible2: ApplyType!='1'?true:false
                        });
                        setTimeout(() => {
                            if(ApplyType=='1'){
                                this.formRef.current.setFieldsValue({
                                    ApplyID,ApplyType:'建当',UserID:UserID.substring(0,UserID.length-4)+"****",UserName,Address,Phone,Email,Wechat,Plandate,ApplyDate,Gender:Gender==='1'?'女':'男',
                                    Amount,ANotes
                                })
                                this.getThings1(TID)
                            }else{
                                this.formRef2.current.setFieldsValue({
                                    PTID,ApplyID,ApplyType:ApplyType==='2'?'续当':ApplyType==='3'?'赎当':'绝当',UserID:UserID.substring(0,UserID.length-4)+"****",UserName,Address,Phone,Email,Wechat,Plandate,ApplyDate,Gender:Gender==='1'?'女':'男',
                                    Amount,ANotes
                                })
                                this.getThings2(PTID)
                            }
                        }, 200);
                        //console.log(TID)
                    },
                };
                }}
            />
            </div>
            <Drawer
            title="申请单详情"
            width={820}
            style={{zIndex:10}}
            onClose={this.onClose}
            visible={this.state.visible1}
            bodyStyle={{ paddingBottom: 80 }}
            extra={
                <Space>
                    <Button onClick={this.onClose}>返回</Button>
                    <Button type='primary' onClick={this.showModal}>报价</Button>
                </Space>
            }
            >
            <Form layout="vertical" ref={this.formRef} hideRequiredMark
            initialValues={{UserID,UserName,Gender,Address,Phone,Email,Wechat,ANotes}}
            >
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyID"
                        label="申请单编号"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyType"
                        label="申请类型"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyDate"
                        label="申请时间"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="Plandate"
                        label="计划到行时间"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <hr/>
                <p style={{margin:0,minHeight:'30px'}}>用户信息</p>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                        name="UserID"
                        label="用户证件号"
                        >
                        <Input readOnly/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="UserName"
                        label="用户姓名"
                        >
                        <Input readOnly/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Gender"
                        label="性别"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                        name="Phone"
                        label="联系电话"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Email"
                        label="邮箱地址"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Wechat"
                        label="微信号"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="Address"
                    label="详细住址"
                    >
                    <Input.TextArea rows={2} readOnly/>
                    </Form.Item>
                </Col>
                </Row>
                <hr/>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="detail"
                    label="物品明细"
                    >
                        <p style={{margin:0,minHeight:0}}>物品份数 : {this.state.dataSource1.length}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;期望到手价 : {this.state.ExpectAmount}</p>
                    </Form.Item>
                </Col>
                </Row>  
                {dataSource1.map((obj,index) => {
                const {UIID,title,BuyPrice,Quantity,Specification,DocDetail,Discript,images} = obj
                return (
                    <Row gutter={16} key={index}>
                    <Col span={24}>
                        <Form.Item
                        label={index*1+1}
                        >
                            <Space size={20} align='start' style={{display:'flex',marginRight:'50px'}}>
                                <Image
                                preview={{visible:false}}
                                width={200}
                                src={images[0]}
                                onClick={() => this.setState({ImageVisible:true})}
                                />
                                <div style={{ display: 'none' }}>
                                <Image.PreviewGroup preview={{ visible:ImageVisible, onVisibleChange: vis => this.setState({ImageVisible:vis}) }}>
                                    {images.map((item,i)=>
                                        (
                                            <Image key={i} src={item} />
                                        ) 
                                    )}
                                </Image.PreviewGroup>
                                </div>
                                <Space size={5} direction="vertical" style={{marginTop:'-100px'}}>
                                    <p>物品名称 : {title}</p>
                                    <p>购入价 : {BuyPrice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 : {Quantity}</p>
                                    <p>物品详情 : {Specification}</p>
                                    <p>可提供附件 : {DocDetail}</p>
                                    <p>物品描述 : {Discript}</p>
                                </Space>
                            </Space>
                        </Form.Item>
                    </Col>
                    </Row>
                );
                })}
                <hr/>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="Amount"
                    label="预估价"
                    >
                    <p style={{margin:0,minHeight:0,color:'orange',fontSize:'26px'}}>{this.state.Amount?this.state.Amount:0}</p>
                    </Form.Item>
                </Col>
                </Row>  
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="ANotes"
                    label="备注"
                    >
                    <Input.TextArea readOnly rows={2}/>
                    </Form.Item>
                </Col>
                </Row>
            </Form>
            </Drawer>
            <Drawer
            title="申请单详情2"
            width={820}
            style={{zIndex:10}}
            onClose={this.onClose}
            visible={this.state.visible2}
            bodyStyle={{ paddingBottom: 80 }}
            extra={
                <Space>
                    <Button onClick={this.onClose}>返回</Button>
                    <Button type='primary' onClick={this.showModal}>报价</Button>
                </Space>
            }
            >
            <Form layout="vertical" ref={this.formRef2} hideRequiredMark
            initialValues={{UserID,UserName,Gender,Address,Phone,Email,Wechat,ANotes}}
            >
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyID"
                        label="申请单编号"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyType"
                        label="申请类型"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="ApplyDate"
                        label="申请时间"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                        name="Plandate"
                        label="计划到行时间"
                        >
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <hr/>
                <p style={{margin:0,minHeight:'30px'}}>用户信息</p>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                        name="UserID"
                        label="用户证件号"
                        >
                        <Input readOnly/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="UserName"
                        label="用户姓名"
                        >
                        <Input readOnly/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Gender"
                        label="性别"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                        name="Phone"
                        label="联系电话"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Email"
                        label="邮箱地址"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="Wechat"
                        label="微信号"
                        >
                        <Input readOnly />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="Address"
                    label="详细住址"
                    >
                    <Input.TextArea rows={2} readOnly/>
                    </Form.Item>
                </Col>
                </Row>
                <hr/>
                    <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                        name="detail"
                        label="当单详情"
                        >
                            <p style={{margin:0}}>当单编号 : {PTID}</p>
                            <p style={{margin:0}}>典当期限 : {StartDate}&nbsp;&nbsp;~&nbsp;&nbsp;{EndDate}</p>
                            <p style={{margin:0}}>当单备注 : {Notes?Notes:'无'}</p>
                            <p style={{margin:0}}>当单总价 : {totalAmount}</p>
                            <p style={{margin:0}}>费用总额 : {Total}</p>
                            <p style={{margin:0}}>费用备注 : {ENotes?ENotes:'无'}</p>
                        </Form.Item>
                    </Col>
                    </Row>  
                <hr/>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="detail"
                    label="物品明细"
                    >
                        <p style={{margin:0,minHeight:0}}>物品份数 : {this.state.dataSource1.length}</p>
                    </Form.Item>
                </Col>
                </Row>  
                {dataSource1.map((obj,index) => {
                const {PIID,title,AssessPrice,Rate,Amount,Quantity,Specification,Documents,Discript,images} = obj
                return (
                    <Row gutter={16} key={index}>
                    <Col span={24}>
                        <Form.Item
                        label={index*1+1}
                        >
                            <Space size={20} align='start' style={{display:'flex',marginRight:'50px'}}>
                                <Image
                                preview={{visible:false}}
                                width={200}
                                src={images[0]}
                                onClick={() => this.setState({ImageVisible:true})}
                                />
                                <div style={{ display: 'none' }}>
                                <Image.PreviewGroup preview={{ visible:ImageVisible, onVisibleChange: vis => this.setState({ImageVisible:vis}) }}>
                                    {images.map((item,i)=>
                                        (
                                            <Image key={i} src={item} />
                                        ) 
                                    )}
                                </Image.PreviewGroup>
                                </div>
                                <Space size={5} direction="vertical">
                                    <p>当品编号 : {PIID}</p>
                                    <p>当品名称 : {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 : {Quantity}</p>
                                    <p>估价 : {AssessPrice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;折价率 : {Rate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当价 : {Amount}</p>
                                    <p>物品详情 : {Specification?Specification:'无'}</p>
                                    <p>包含附件 : {Documents?Documents:'无'}</p>
                                    <p>物品描述 : {Discript?Discript:'无'}</p>
                                </Space>
                            </Space>
                        </Form.Item>
                    </Col>
                    </Row>
                );
                })}
                <hr/>
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="Amount"
                    label={ApplyType==='2'?'预估费用':ApplyType==='3'?'预估赎金':'预估加价'}
                    >
                    <p style={{margin:0,minHeight:0,color:'orange',fontSize:'26px'}}>{this.state.Amount?this.state.Amount:0}</p>
                    </Form.Item>
                </Col>
                </Row>  
                <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                    name="ANotes"
                    label="备注"
                    >
                    <Input.TextArea readOnly rows={2}/>
                    </Form.Item>
                </Col>
                </Row>
            </Form>
            </Drawer>
            <Modal
            title="报价"
            centered
            visible={this.state.visible_modal}
            onOk={() => {this.handleSave();this.setState({visible_modal:false})}}
            onCancel={() => {this.setState({visible_modal:false})}}
            width={360}
            maskClosable={false}
            style={{zIndex:99}}
            >
            <Form ref={this.formRef3} hideRequiredMark
            initialValues={{ApplyID}}
            >
                <Form.Item
                name="ApplyID"
                label="申请单编号"
                >
                    <Input readOnly/>
                </Form.Item>
                <Form.Item
                name="Amount"
                label={ApplyType==='1'?"预 估 当 价":ApplyType==='2'?'预 估 费 用':ApplyType==='3'?'预 估 赎 金':'预 估 加 价'}
                >
                    <Input status="warning" style={{ width: '100%' }} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({Amount:e.target.value});}}/>
                </Form.Item>
                <Form.Item
                name="ANotes"
                label="报 价 备 注"
                >
                    <Input.TextArea rows={2} style={{resize:'none'}} onChange={(e)=>{this.setState({ANotes: e.target.value})}} placeholder="请输入报价备注" />
                </Form.Item>
            </Form>
            </Modal>
        </div>
        )
    }
}