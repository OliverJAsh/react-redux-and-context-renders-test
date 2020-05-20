import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect, ConnectedProps, Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { unstable_trace as trace } from 'scheduler/tracing';

const isEnhancedContextValue = false;
const IsEnhancedContext = React.createContext(isEnhancedContextValue);

type State = { windowWidth: number | null };
type Action = { type: 'SetWindowWidth'; windowWidth: number };

const getWindowWidth = (state: State) => state.windowWidth;

const initialState: State = { windowWidth: null };

const reducer = (state: State = initialState, action: Action) => {
    switch (action.type) {
        case 'SetWindowWidth':
            return { windowWidth: action.windowWidth };
        default:
            return state;
    }
};
const store = createStore(reducer);

//
//
//

const Item: React.FC = () => {
    const windowWidth = useSelector(getWindowWidth);
    console.log('Item', { windowWidth });
    return null;
};

const gridConnect = connect((state: State) => ({
    windowWidth: getWindowWidth(state),
}));
type GridProps = ConnectedProps<typeof gridConnect>;
const Grid: React.FC<GridProps> = ({ windowWidth }) => {
    console.log('Grid', { windowWidth });
    return (
        <IsEnhancedContext.Consumer>
            {(isEnhanced) => (isEnhanced ? <Item /> : null)}
        </IsEnhancedContext.Consumer>
    );
};
const GridConnected = gridConnect(Grid);

const gridWrapperMapStateToProps = (state: State) => ({
    windowWidth: getWindowWidth(state),
});
const gridWrapperConnect = connect(gridWrapperMapStateToProps);
type GridWrapperProps = ConnectedProps<typeof gridWrapperConnect>;
const GridWrapper: React.FC<GridWrapperProps> = ({ windowWidth }) => {
    console.log('GridWrapper', { windowWidth });
    return <GridConnected />;
};
const GridWrapperWrapper = gridWrapperConnect(GridWrapper);

class AppOutside extends React.Component<{}, { isEnhanced: boolean }> {
    state = { isEnhanced: isEnhancedContextValue };

    componentDidMount() {
        trace('isEnhanced: true', performance.now(), () => {
            this.setState({ isEnhanced: true });
        });
    }
    render() {
        return (
            <IsEnhancedContext.Provider value={this.state.isEnhanced}>
                {this.props.children}
            </IsEnhancedContext.Provider>
        );
    }
}

class AppInside extends React.Component {
    componentDidMount() {
        trace('SetWindowWidth', performance.now(), () => {
            store.dispatch({
                type: 'SetWindowWidth',
                windowWidth: window.innerWidth,
            });
        });
    }
    render() {
        return <GridWrapperWrapper />;
    }
}

//
//
//

const el = (
    <AppOutside>
        <Provider store={store}>
            <AppInside />
        </Provider>
    </AppOutside>
);

ReactDOM.render(el, document.body);
