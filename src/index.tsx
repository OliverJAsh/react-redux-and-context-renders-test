import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect, ConnectedProps, Provider } from 'react-redux';
import { createStore } from 'redux';
import { unstable_trace as trace } from 'scheduler/tracing';

/**
 * Problem: `Item` is rendered with the new `windowWidth` before its parent, `Grid`.
 */

const isEnhancedContextDefaultValue = false;
const IsEnhancedContext = React.createContext(isEnhancedContextDefaultValue);

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

const itemMapStateToProps = (state: State) => ({
    windowWidth: getWindowWidth(state),
});
const itemConnect = connect(itemMapStateToProps);
type ItemProps = ConnectedProps<typeof itemConnect>;
const Item: React.FC<ItemProps> = ({ windowWidth }) => {
    console.log('Item', { windowWidth });
    return null;
};
const ItemConnected = itemConnect(Item);

const gridMapStateToProps = (state: State) => ({
    windowWidth: getWindowWidth(state),
});
const gridConnect = connect(gridMapStateToProps);
type GridProps = ConnectedProps<typeof gridConnect>;
const Grid: React.FC<GridProps> = ({ windowWidth }) => {
    console.log('Grid', { windowWidth });
    return (
        <IsEnhancedContext.Consumer>
            {(isEnhanced) => (isEnhanced ? <ItemConnected /> : null)}
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
const GridWrapperConnected = gridWrapperConnect(GridWrapper);

class AppOutside extends React.Component<{}, { isEnhanced: boolean }> {
    state = { isEnhanced: isEnhancedContextDefaultValue };

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
        return <GridWrapperConnected />;
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

ReactDOM.render(el, document.querySelector('#root'));
