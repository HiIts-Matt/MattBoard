export const config = {
    pages: [
        {
            name: "Main Page",
            showTitle: true,
            sections: [
                {
                    flex: 1,
                    components: [
                        {
                            type: "clock",
                            position: 'top-right',
                            variant: 'both',
                            size: 'lg',
                            showNumbers: false,
                            showMarks: false,
                        },
                        {
                            type: 'photo',
                            variant: 'cover',
                            changeMins: 2,
                            brightness: 0.5,
                        }
                    ]
                },
            ]
        }
    ]
}