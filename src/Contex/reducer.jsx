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
const Reducer = (state, action) => {
  switch (action.type) {
    case SET_PROJECT:
      return {
        ...state,
        selectedProject: action.payload,
      };
    case SET_ALL_PROJECTS:
      return {
        ...state,
        allProjects: action.payload,
      };
    case SETSELECTEDPAGEID:
      return {
        ...state,
        selectedPageId: action.payload,
      };
      case SETSELECTEDENGAGEMENTID:
        return {
          ...state,
          selectedEngagementId: action.payload,
        };
    case SET_ACCOUNT:
      return {
        ...state,
        allAccountsArr: action.payload,
      };
    case SET_HOME_PAGE_DATA:
      return {
        ...state,
        homepageDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_HOME_PAGE_GRAPH_DATA:
      return {
        ...state,
        homepageGraphDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ANALYTIC_CHILD_PAGE_DATA:
      return {
        ...state,
        AnalyticChildDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ANALYTIC_CONTENT_PAGE_DATA:
      return {
        ...state,
        AnalyticContentDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ANALYTIC_PAGES_PAGE_DATA:
      return {
        ...state,
        AnalyticPagesDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ANALYTIC_POSTS_PAGE_DATA:
      return {
        ...state,
        AnalyticPostsDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ANALYTIC_STORIES_PAGE_DATA:
      return {
        ...state,
        AnalyticStoriesDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_ENGAGE_MENT_PAGE_DATA:
      return {
        ...state,
        EngageMentDataObj: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_USER_INFORMATION:
      return {
        ...state,
        userInformation: action.payload,
      };
    case SET_USER_SUBSCRIPTION:
      return {
        ...state,
        userSubscription: {
          isFetching: action.payload.isFetching,
          data: action.payload.data,
          error: action.payload.error,
          interNetLost: action.payload.interNetLost,
        },
      };
    case SET_USER_SUBSCRIPTION_OPEN_DIALOGUE:
      return {
        ...state,
        openPricingDialogBox: action.payload.data,
      };

    default:
      return state;
  }
};
export default Reducer;
