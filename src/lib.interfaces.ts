interface libCSSParameters {
    display?: string;
    visibility?: string;

    height?: string;
    width?: string;

    top?: string;
    bottom?: string;
    left?: string;
    right?: string;

    margin?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;

    padding?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;

    background?: string;
    backgroundColor?: string;

    border?: string;
    borderColor?: string;
    borderCollapse?: string;
    borderSpacing?: string;
    borderStyle?: string;
    borderWidth?: string;

    /** Specifies the color of the text in the element. */
    color?: string;

    boxShadow?: string;
    boxAlign?: string;

    transition?: string;
    transitionDelay?: string;
    transitionDuration?: string;
    transitionProperty?: string;
    transitionTimingFunction?: string;

    animation?: string;
    animationDelay?: string;
    animationDirection?: string;
    animationDuration?: string;
    animationFillMode?: string;
    animationIterationCount?: string;
    animationName?: string;
    animationPlayState?: string;
    animationTimingFunction?: string;
}

interface libAjaxParameters {
    /** URL to send the AJAX request. */
    url?: string;
    /** Type of method to send the AJAX request with, POST or GET is supported. Default: GET */
    method?: string;
    /** Data to send with the request. */
    data?: any;

    /** If the AJAX request should be sent asynchronous. Default: true */
    async?: boolean;
    /** If the browser should be prevented to cache the AJAX request. Default: false */
    cache?: boolean;

    /** Type of data that should be returned. Default: raw */
    type?: string;

    /** Method that will be called when the AJAX request is successfull. */
    success?: (result: any) => void;
    /** Method that will be called when something goes wrong with the AJAX request. */
    error?: (status: number, message: string) => void;
}