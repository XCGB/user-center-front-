import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable } from '@ant-design/pro-components';
import {appendUser, deleteUsers, searchUsers, uploadAvatar} from '@/services/ant-design-pro/api';
import {useEffect, useRef, useState} from 'react';
import {Button, Form, Image, Input, message, Modal, Select, Space, Tag} from "antd";
import {InboxOutlined, PlusOutlined} from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";

// 弹出新增用户界面
const UserFormModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const [, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] =  useState(null);

  const handleOk = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      onCreate(values);
    });
  };

  const handleAvatarChange = async (info) => {
    const { status, originFileObj } = info.file;
    if (status === 'done') {
      // 上传成功
      setAvatarFile(originFileObj);
      try {
        // 调用异步函数上传头像到阿里OSS
        const url  = await uploadAvatar(originFileObj);
        form.setFieldsValue({ avatarUrl: url }); // 将URL设置到表单字段中
        setAvatarUrl(url); // 设置头像URL
        message.success('头像上传到阿里OSS成功');
      } catch (error) {
        message.error('头像上传OSS失败');
      }
    } else if (status === 'error') {
      // 上传失败
      message.error('头像上传失败');
    }
  };

  useEffect(() => {
    if (visible) {
      setAvatarFile(null);
      setAvatarUrl('');
    }
  }, [visible]);

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
          name="username"
          label="用户名"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="userAccount"
          label="账户名"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="avatarUrl" label="头像">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar"  style={{ width: '150px', height: '100px' }} />
          ) : (
            <Dragger
              accept="image/*"
              onChange={handleAvatarChange}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖动文件到此区域上传头像</p>
            </Dragger>
          )}
        </Form.Item>
        <Form.Item
          name="gender"
          label="性别"
          rules={[{ required: true, message: '请选择性别！' }]}
        >
          <Select>
            <Option value={0}>男</Option>
            <Option value={1}>女</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话"
          rules={[{ required: true, message: '请输入电话！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
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
    search: false,
  },
  {
    title: '头像',
    dataIndex: 'avatarUrl',
    search: false,
    render: (_, record) => (
      <div>
        <Image src={record.avatarUrl} width={100}></Image>
      </div>
    ),
  },
  {
    title: '性别',
    dataIndex: 'gender',
    search: false,
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
    search: false,
  },
  {
    title: '邮件',
    dataIndex: 'email',
    search: false,
  },
  {
    title: '状态',
    dataIndex: 'userStatus',
    filters: true,
    onFilter: true,
    search: false,
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
    search: false,
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
    valueType: 'date',
    search: false,
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

  const handleCreateUser = async (values: any) => {
    try {
      // 调用异步函数appendUser
      // console.log(values);
      await appendUser(values);
      message.success('用户创建成功');
      // 在这里可以执行其他相关操作或刷新数据
    } catch (error) {
      message.error('用户创建失败');
      // 在这里可以处理错误情况
    }
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
