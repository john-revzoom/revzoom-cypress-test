import React, { useEffect, useRef, useState } from "react";
import "antd/dist/antd.css";
import { Button, Divider, Skeleton } from "antd";
import classnames from "classnames";
import styles from "./user-projects.module.scss";
import { Header } from "../../components/header";
import { SearchInput } from "../../components/search-input";
import ProjectCard from "../../components/project-card";
import { useTranslation } from "react-i18next";
import API from "../../../util/web/api";
import AutomationListResponse from "../../../models/AutomationListResponse";
import Optional from "../../../util/Optional";
import AutomationItem from "../../../models/AutomationItem";
import { isEmpty, toPath } from "lodash";
import { Logger } from "aws-amplify";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import { useAuth } from "../../../hooks/useAuth";
import { UserDetails } from "../../../context/IAuthContext";
import AuthenticationController from "../../../controller/AuthenticationController";

export type UserProjectsProps = {
  /**
   * style fo inline CSS
   */
  style?: Object;
  /**
   * classname to override CSS
   */
  className?: string;
};
const logger = new Logger("ui-components:home-components:user-projects:UserProjects");
const REFRESH_TIMEOUT = 30000;

export function UserProjects({ style, className }: UserProjectsProps) {
  const [projectList, setProjectList] = useState<AutomationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const [filterName, setFilterName] = useState<string>("");
  const [pageLimit] = useState<number>(6);
  const [pageStart] = useState<number>(0);
  const [isNoMoreResult, setIsNoMoreResult] = useState<boolean>(false);
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const { t } = useTranslation();
  const projectRef = useRef<AutomationItem[]>([]);
  const projectCountRef = useRef<number>(0);
  const refreshTimerRef = useRef<any>();
  const { user } = useAuth();

  useEffect(() => {
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        const cognitoUser = value.get();
        if (!!cognitoUser.cognito) {
          AuthenticationController.handleAuthenticationSuccess(cognitoUser.cognito).then(() => {
            callGetAutomationList();
          });
        }
      }
    });
    return () => {
      setProjectList([]);
      handleReset();
      stopAutoRefresh();
    };
  }, []);

  function stopAutoRefresh() {
    logger.debug("Stopped auto refresh of projects.");
    clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = null;
  }

  const setupAutoRefresh = () => {
    stopAutoRefresh();
    if (projectRef.current && projectRef.current.some(el => el.getStatus() === AUTOMATION_STATUS.RUNNING)) {
      logger.debug("setup auto refresh of projects with interval", REFRESH_TIMEOUT);
      refreshTimerRef.current = setTimeout(() => reloadProjects(projectCountRef.current), REFRESH_TIMEOUT);
    }
  };

  async function reloadProjects(limit: number = pageLimit) {
    //TODO: abort any pending request before making the request again
    try {
      const response: Optional<AutomationListResponse> = await API.getAutomationList(
        filterName.trim(),
        limit,
        pageStart
      );
      const data = response.getOrElse(null);
      if (data) {
        const projects = data.getAllEntries();
        projectRef.current = projects;
        setProjectList(projects);
      } else {
        setProjectList([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setupAutoRefresh();
    }
  }

  async function loadMoreProjects() {
    if (refreshTimerRef.current) {
      stopAutoRefresh();
    }
    try {
      handleReset();
      const response: Optional<AutomationListResponse> = await API.getAutomationList(
        filterName,
        pageLimit,
        projectList.length
      );
      const data = response.getOrElse(null);
      if (data) {
        const newProjects = data.getAllEntries();
        const total = data.getTotalCount();
        projectRef.current = [...projectRef.current, ...newProjects];
        projectCountRef.current += data.getCurrentCount();
        setProjectList([...projectList, ...newProjects]);
        if (total > projectRef.current.length) {
          setLoadMore(true);
        } else {
          setIsNoMoreResult(true);
        }
      } else {
        setIsNoMoreResult(true);
      }
      setIsLoaded(true);
    } catch (error) {
      setIsLoaded(true);
      setIsNoMoreResult(true);
      console.log(error);
    } finally {
      setupAutoRefresh();
    }
  }

  /**
   * to call GET automation list API
   */
  async function callGetAutomationList(reset: boolean = false) {
    try {
      handleReset();
      //TODO: abort any pending request before making the request again
      const response: Optional<AutomationListResponse> = await API.getAutomationList(
        !reset ? filterName.trim() : "",
        pageLimit,
        pageStart
      );
      const data = response.getOrElse(null);
      if (data) {
        const projects = data.getAllEntries();
        projectCountRef.current = data.getCurrentCount() < 6 ? 6 : data.getCurrentCount();
        const total = data.getTotalCount();
        setTotalProjects(total);
        setProjectList(projects);
        setLoadMore(true);
        projectRef.current = projects;
      } else {
        setProjectList([]);
      }
      setIsLoaded(true);
    } catch (error) {
      setIsLoaded(true);
      console.log(error);
    } finally {
      setupAutoRefresh();
    }
  }

  /**
   * reset to initial states
   */
  function handleReset() {
    setLoadMore(false);
    setIsLoaded(false);
    setIsNoMoreResult(false);
  }

  function searchProject() {
    setProjectList([]);
    callGetAutomationList();
  }

  function handleFilterNameChange(value: string) {
    setFilterName(value);
    if (isEmpty(value)) {
      handleClearSearch();
    }
  }

  function handleClearSearch() {
    setProjectList([]);
    setFilterName("");
    callGetAutomationList(true);
  }

  const skeletonItems: JSX.Element[] = [];
  for (let i = 1; i <= 6; i++) {
    skeletonItems.push(
      <div key={i} className={styles.projectSkeleton}>
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className={classnames(className, styles.userProjects)}>
      <Header className={styles.headingContainer} headerClass={styles.projectHeading} text={t("home.projects")} />

      <SearchInput onPressEnter={searchProject} onChange={handleFilterNameChange} onClear={handleClearSearch} />

      <div
        className={classnames(styles.projectList, {
          [styles.emptyProjectList]: isLoaded && !projectList.length
        })}
        data-cy="project-list"
      >
        {projectList && projectList.length > 0
          ? projectList.map((project: AutomationItem) => {
              return (
                <ProjectCard
                  key={project.getAutomationId()}
                  id={project.getAutomationId()}
                  title={project.getName()}
                  status={project.getStatus()}
                  createdTime={project.getCreationDate().fromNow()}
                  project={project}
                  projectList={projectList}
                  setProjectList={setProjectList}
                />
              );
            })
          : null}
        <>{!isLoaded ? skeletonItems : null}</>
        {isLoaded && !projectList.length ? <div className={styles.projectNoData}>{t("home.no_data")}</div> : null}
      </div>
      {loadMore && totalProjects > pageLimit ? (
        <div className={styles.loadMore}>
          <Button onClick={loadMoreProjects}>{t("home.load_more")}</Button>
        </div>
      ) : null}
      {isNoMoreResult ? (
        <div className={styles.projectNoMoreResult}>
          <Divider>{t("home.no_more_result")}</Divider>
        </div>
      ) : null}
    </div>
  );
}
