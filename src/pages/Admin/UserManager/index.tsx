import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable } from '@ant-design/pro-components';
import {searchUsers} from '@/services/ant-design-pro/api';
import {useRef } from 'react';
import {Button, Image, Space, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";

const columns: ProColumns<API.CurrentUser>[] = [
  {
    dataIndex: 'id',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '用户账名',
    dataIndex: 'userAccount',
  },
  {
    title: '头像',
    dataIndex: 'avatarUrl',
    render: (_, record) => (
      <div>
        <Image src={record.avatarUrl} width={100}></Image>
      </div>
    ),
  },
  {
    title: '性别',
    dataIndex: 'gender',
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      // all: {text: '超长'.repeat(50)},
      0: {text: '男', status: 'success'},
      1: {text: '女', status: 'success'},
    },
    render: (text, record) => {
      const genderLabel = record.gender === 0 ? '男' : '女';
      const genderColor = record.gender === 0 ? 'seagreen' : 'cornflowerblue'; // 海绿色 矢车菊蓝
      return (
        <Space>
          <Tag color={genderColor}>{genderLabel}</Tag>
        </Space>
      );
    },
  },
  {
    title: '电话',
    dataIndex: 'phone',
  },
  {
    title: '邮件',
    dataIndex: 'email',
  },
  {
    title: '状态',
    dataIndex: 'userStatus',
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      0: {text: '正常', status: 'Success'},//颜色是红色
      1: {
        text: '非法',
        status: 'Error', //颜色是灰色
      },
    },
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    filters: true,
    onFilter: true,
    valueType: 'select',
    valueEnum: {
      0: {text: '普通用户', status: 'Default'},
      1: {
        text: '管理员',
        status: 'Success', //颜色是绿色
      },
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    valueType: 'dateTime',
  },
  {
    title: '操作',
    valueType: 'option',
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(record.id);
        }}
      >
        编辑
      </a>,
      <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
        删除
      </a>,
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();

  return (
    <ProTable<API.CurrentUser>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}, sort, filter) => {
        console.log(params, sort, filter);
        const userList = await searchUsers(params);
        return {
          data: userList
        }
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      form={{
        // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
            };
          }
          return values;
        },
      }}
      pagination={{
        pageSize: 5,
      }}
      dateFormatter="string"
      headerTitle="高级表格"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建
        </Button>,
        ]}
    />
  );
};
