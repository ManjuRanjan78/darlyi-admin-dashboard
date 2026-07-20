/* eslint-disable react/prop-types */
import { useReducer } from "react";
import Context from "./Context";
import Reducer from "./reducer";
import {
  SET_ACCOUNT,
  SET_ALL_PROJECTS,
  SET_ANALYTIC_CHILD_PAGE_DATA,
  SET_ANALYTIC_CONTENT_PAGE_DATA,
  SET_ANALYTIC_PAGES_PAGE_DATA,
  SET_ANALYTIC_POSTS_PAGE_DATA,
  SET_ANALYTIC_STORIES_PAGE_DATA,
  SET_ENGAGE_MENT_PAGE_DATA,
  SET_HOME_PAGE_DATA,
  SET_HOME_PAGE_GRAPH_DATA,
  SET_PROJECT,
  SET_USER_INFORMATION,
  SET_USER_SUBSCRIPTION,
  SET_USER_SUBSCRIPTION_OPEN_DIALOGUE,
  SETSELECTEDPAGEID,
  SETSELECTEDENGAGEMENTID
} from "./action";
export default function State(props) {
  const initialState = {
    selectedProject: [],
    userInformation: [],
    openPricingDialogBox: false,
    userSubscription: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    allProjects: {},
    allAccountsArr: [],
    homepageDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    homepageGraphDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    AnalyticChildDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    AnalyticContentDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    AnalyticPagesDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    AnalyticPostsDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    AnalyticStoriesDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    EngageMentDataObj: {
      isFetching: true,
      data: {},
      error: false,
      interNetLost: false,
    },
    selectedPageId: "",
    selectedEngagementId: "",
  };

  const [state, dispatch] = useReducer(Reducer, initialState);

  const setSelectedPageId = (pageId) => {
    dispatch({
      type: SETSELECTEDPAGEID,
      payload: pageId,
    });
  };
  const setSelectedEngagementId = (pageId) => {
    dispatch({
      type: SETSELECTEDENGAGEMENTID,
      payload: pageId,
    });
  };
  const setSelectedProject = (project) => {
    dispatch({
      type: SET_PROJECT,
      payload: project,
    });
  };

  const setAllAccountsContext = (accounts) => {
    dispatch({
      type: SET_ACCOUNT,
      payload: accounts,
    });
  };
  const setUserInformation = (user) => {
    dispatch({
      type: SET_USER_INFORMATION,
      payload: user,
    });
  };

  const setHomePageDataContext = (data) => {
    dispatch({
      type: SET_HOME_PAGE_DATA,
      payload: data,
    });
  };
  const setHomePageGraphDataContext = (data) => {
    dispatch({
      type: SET_HOME_PAGE_GRAPH_DATA,
      payload: data,
    });
  };
  const setHomePageDataContext2 = (data) => {
    dispatch({
      type: SET_ANALYTIC_CHILD_PAGE_DATA,
      payload: data,
    });
  };
  const setAnalyticContentPageData = (data) => {
    dispatch({
      type: SET_ANALYTIC_CONTENT_PAGE_DATA,
      payload: data,
    });
  };
  const setAnalyticPagesPageData = (data) => {
    dispatch({
      type: SET_ANALYTIC_PAGES_PAGE_DATA,
      payload: data,
    });
  };
  const setAnalyticPostsPageData = (data) => {
    dispatch({
      type: SET_ANALYTIC_POSTS_PAGE_DATA,
      payload: data,
    });
  };
  const setAnalyticStoriesPageData = (data) => {
    dispatch({
      type: SET_ANALYTIC_STORIES_PAGE_DATA,
      payload: data,
    });
  };
  const setEngageMentPageData = (data) => {
    dispatch({
      type: SET_ENGAGE_MENT_PAGE_DATA,
      payload: data,
    });
  };
  const setAllProjects = (data) => {
    dispatch({
      type: SET_ALL_PROJECTS,
      payload: data,
    });
  };
  const setUserSubscription = (data) => {
    dispatch({
      type: SET_USER_SUBSCRIPTION,
      payload: data,
    });
  };

  const setOpenPricingDialogBox = (data) => {
    dispatch({
      type: SET_USER_SUBSCRIPTION_OPEN_DIALOGUE,
      payload: data,
    });
  };

  return (
    <Context.Provider
      value={{
        selectedProject: state.selectedProject,
        allProjects: state.allProjects,
        allAccountsArr: state.allAccountsArr,
        homePageData: state.homepageDataObj,
        homePageGraphData: state.homepageGraphDataObj,
        analyticChildPageData: state.AnalyticChildDataObj,
        analyticContentPageData: state.AnalyticContentDataObj,
        analyticPagesPageData: state.AnalyticPagesDataObj,
        analyticPostsPageData: state.AnalyticPostsDataObj,
        analyticStoriesPageData: state.AnalyticStoriesDataObj,
        enageMentPageData: state.EngageMentDataObj,
        userInformation: state.userInformation,
        userSubscription: state.userSubscription,
        pricingDialogBox: state.openPricingDialogBox,
        selectedPageId: state.selectedPageId,
        selectedEngagementId:state.selectedEngagementId,
        setAllAccountsContext,
        setSelectedProject,
        setHomePageDataContext,
        setHomePageGraphDataContext,
        setHomePageDataContext2,
        setAnalyticContentPageData,
        setAnalyticPagesPageData,
        setAnalyticPostsPageData,
        setAnalyticStoriesPageData,
        setEngageMentPageData,
        setAllProjects,
        setUserInformation,
        setUserSubscription,
        setOpenPricingDialogBox,
        setSelectedPageId,
        setSelectedEngagementId
      }}
    >
      {props.children}
    </Context.Provider>
  );
}
