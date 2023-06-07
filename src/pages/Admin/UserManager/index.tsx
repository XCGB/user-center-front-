import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable } from '@ant-design/pro-components';
import {deleteUsers, searchUsers} from '@/services/ant-design-pro/api';
import {useRef, useState} from 'react';
import {Button, Form, Image, Input, message, Modal, Space, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";

// 弹出新增用户界面
const UserFormModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      onCreate(values);
    });
  };

  return (
    <Modal
      visible={visible}
      title="新增用户"
      okText="创建"
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="用户名"
          label="Username"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="邮箱"
          label="Email"
          rules={[{ required: true, message: 'Please input the email!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 定义列的属性
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
      <a
        key="delete"
        onClick={() => {
          const deleteConfirmationModal = Modal.confirm({
            title: '删除用户',
            content: ' 请确认是否删除用户!',
            onOk: () => {
              deleteConfirmationModal.destroy();
              deleteUsers(record.id)
                .then(() => {
                  return message.success('用户删除成功');
                })
                .catch((error) => {
                  return  message.error('用户删除失败');
                });
            },
            onCancel: () => {
              deleteConfirmationModal.destroy();
            },
          });
        }}
      >
        删除
      </a>,
    ],
  },
];


export default () => {
  const [showForm, setShowForm] = useState(false);
  const actionRef = useRef<ActionType>();

  const handleCreateUser = (values: any) => {
    console.log('Received values of form:', values);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
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
            setShowForm(true);
          }}
          type="primary"
        >
          新建
        </Button>,
        <UserFormModal
          visible={showForm}
          onCancel={handleCancel}
          onCreate={handleCreateUser}
        />,
        ]}
    />
    </div>
  );
};
