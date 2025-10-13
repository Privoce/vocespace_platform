import { LoginForm } from "@/components/login-form";
import styles from "@/styles/login.module.scss";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Divider, Input } from "antd";

export default function Page() {
  return (
    <div className={styles.login}>
      <div className={styles.login_left}>
        <header className={styles.login_left_header}>
          <img src="/logo.svg"></img>
        </header>
        <main className={styles.login_left_main}>
          <div className={styles.login_left_main_tt}>
            <div className={styles.login_left_main_tt_title}>
              欢迎使用VoceSpace
            </div>
            <div className={styles.login_left_main_tt_subtitle}>
              请登录以继续
            </div>
          </div>
          <div className={styles.login_left_main_others}>
            <Button
              icon={<GoogleOutlined></GoogleOutlined>}
              size="large"
              block
              type="primary"
            >
              使用Google账号登录
            </Button>
          </div>
          <Divider style={{ borderColor: "#4c4c4c", margin: 0 }}>or</Divider>
          <div className={styles.login_left_main_form}>
            <div className={styles.login_form_input}>
              <div className={styles.login_form_input_title}>邮箱</div>
              <Input size="large" placeholder="请输入邮箱" />
            </div>

            <div className={styles.login_form_input}>
              <div className={styles.login_form_input_title}>
                <span>密码</span>
                <a href="/auth/forget-password" style={{ color: "#22ccee" }}>
                  忘记密码？
                </a>
              </div>

              <Input size="large" placeholder="请输入密码" />
            </div>

            <Button size="large" block type="primary">
              登录
            </Button>
          </div>
          <div className={styles.login_left_main_signup}>
            还没有账号？
            <a
              style={{
                color: "#22ccee",
              }}
            >
              注册一个
            </a>
          </div>
        </main>
        <footer className={styles.login_left_footer}>
          © 2025 VoceSpace, Inc. 保留所有权利。
        </footer>
      </div>
      <div className={styles.login_right}>
        <div className={styles.login_right_content}>
          <h2 className={styles.login_right_content_title}>
            VoceSpace高清会议软件：4K分辨率，60帧，2M码率
          </h2>
          <h3 className={styles.login_right_content_subtitle}>
            体验水晶般清晰的视频会议，4K分辨率，60帧流畅表现，2M码率带来无与伦比的质量。完美适合专业演示和远程协作。
          </h3>
        </div>
      </div>
    </div>
  );
}
