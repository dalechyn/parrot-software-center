import React from "react"
import { useTranslation } from "react-i18next"
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    formControl: {
        marginTop: theme.spacing(2),
        minWidth: 150,
    },
    }),
);

export default function LanguageSwitcher() {
const classes = useStyles();
const { i18n, t } = useTranslation();

return (
<div>
    <FormControl variant="outlined" className={classes.formControl}>
    <InputLabel>{t('changeLanguage')}</InputLabel>
    <Select
        value={i18n.language}
        onChange={(e) =>
            i18n.changeLanguage(e.target.value as string)
        }
        label={t('changeLanguage')}
    >
        <MenuItem value="en">{t('english')}</MenuItem>
        <MenuItem value="it">{t('italian')}</MenuItem>
    </Select>
    </FormControl>
</div>
);
}
