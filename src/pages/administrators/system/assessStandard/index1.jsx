import React, { useState } from 'react';
import { Breadcrumb, Tree } from 'antd';

const initTreeData = [
  {
    title: 'Expand to load',
    key: '0',
  },
  {
    title: 'Expand to load',
    key: '1',
  },
  {
    title: 'Tree Node',
    key: '2',
    isLeaf: true,
  },
]; 

function updateTreeData(list, key, children) {
  return list.map((node) => {
    if (node.key === key) {
      return { ...node, children };
    }

    if (node.children) {
      return { ...node, children: updateTreeData(node.children, key, children) };
    }

    return node;
  });
}

const Demo = () => {
    const [treeData, setTreeData] = useState(initTreeData);
  
    const onLoadData = ({ key, children }) =>
      new Promise((resolve) => {
        if (children) {
          resolve();
          return;
        }

        
  
        setTreeData((origin) =>
          updateTreeData(origin, key, [
            {
              title: 'Child Node',
              key: `${key}-0`,
            },
            {
              title: 'Child Node',
              key: `${key}-1`,
            },
          ]),
        );
        resolve();
      });
  
    return <Tree loadData={onLoadData} treeData={treeData} />;
};

export default function AssessStandard() {
    return (
        <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>系统设置</Breadcrumb.Item>
          <Breadcrumb.Item>估价标准设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10, minHeight: '80vh' }}>
          <Demo />
        </div>
      </div>
    )
}



import React, { Component } from 'react'
import { Breadcrumb, Tree } from 'antd'

const initTreeData = [
  {
    title: 'Expand to load',
    key: '0',
  },
  {
    title: 'Expand to load',
    key: '1',
  },
  {
    title: 'Tree Node',
    key: '2',
    isLeaf: true,
  },
]; 


export default class AssessStandard extends Component {
  render() {
    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>系统设置</Breadcrumb.Item>
          <Breadcrumb.Item>估价标准设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10, minHeight: '80vh' }}>

        </div>
      </div>
    )
  }
}


import React, { Component, useState } from 'react'
import axios from 'axios';
import { Breadcrumb, Tree } from 'antd';

let initTreeData = [];

function updateTreeData(list, key, children) {
  return list.map((node) => {
    if (node.key === key) {
      return { ...node, children };
    }

    if (node.children) {
      return { ...node, children: updateTreeData(node.children, key, children) };
    }

    return node;
  });
}

const Demo = async (e) => {
  const [TreeData,setTreeData] = useState(initTreeData);
  console.log(TreeData,setTreeData)

  let initialdataSource = []

    await axios.get('/getCategory',{
      params:{
        level: 1
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          initialdataSource = response.data
        }
    }).catch(error=>{
        console.log(error);
    });

    //setTreeData(initialdataSource)

  const onLoadData = (e) =>
    new Promise(async (resolve) => {
      if (e.children) {
        resolve();
        return;
      }

      


      resolve();
    });

  return <Tree loadData={onLoadData} treeData={initialdataSource} height={500} style={{ padding: 10, overflow: 'auto' }}/>;
};

export default class PawnDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false ,
      DrawerTitle: '新增仓库',
      dataSource: [],
      count: 0,
      SDID: '',
      SHID: '',
      PTID: '',
      PIID: '',
      title: '',
      Specification: '',
      Documents: '',
      state: '',
      PSstaffIDin: '',
      inDate: '',
      PSstaffIDout: '',
      outDate: '',
      Notes: ''
    };
  }

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    let dataSource = []

    await axios.get('/getCategory',{
      params:{
        level: 1
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
        key: index+"",
        isLeaf: false
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length
    })

    initTreeData=dataSource;

    
  }

  render() {

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>系统设置</Breadcrumb.Item>
          <Breadcrumb.Item>典当类目设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10, height: '80vh'}}>
          <Demo data={this.state.dataSource}/>
        </div>
      </div>
    )
  }
}