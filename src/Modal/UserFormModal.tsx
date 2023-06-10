import {Form, Input, message, Modal, Select} from "antd";
import {useEffect, useState} from "react";
import {uploadAvatar} from "@/services/ant-design-pro/api";
import Dragger from "antd/es/upload/Dragger";
import {InboxOutlined} from "@ant-design/icons";

// 弹出新增用户界面
export const UserFormModal = ({ visible, onCancel, onCreate }) => {
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


